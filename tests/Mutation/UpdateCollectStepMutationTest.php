<?php

namespace CapcoTests\Mutation;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Form\Step\CollectStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\UpdateCollectStepMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Service\ProposalStepSplitViewService;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\HubMetadataRepository;
use Capco\AppBundle\Service\HubDocumentsStepGuard;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
 * @phpunit-status non-compliant
 * @phpunit-reason Invokes GraphQL mutations directly with mocked dependencies instead of verifying the HTTP
 * contract and persisted effects.
 */
class UpdateCollectStepMutationTest extends TestCase
{
    /**
     * @dataProvider hubDateUpdateCases
     */
    public function testUpdatesHubMetadataOnlyForEligibleProjectsWhenDatesChange(
        string $projectTypeSlug,
        bool $datesChanged,
        int $expectedHubCalls
    ): void {
        $events = [];
        $scenario = $this->createScenario($projectTypeSlug, $datesChanged, $expectedHubCalls, $events);
        $startAt = $datesChanged ? '2026-09-22 10:00:00' : '2026-09-21 10:00:00';
        $endAt = $datesChanged ? '2026-10-01 18:00:00' : '2026-09-30 18:00:00';

        $payload = ($scenario['mutation'])(
            new Argument([
                'input' => [
                    'stepId' => 'collect-step',
                    'operationType' => 'EDIT',
                    'startAt' => $startAt,
                    'endAt' => $endAt,
                ],
            ]),
            $scenario['viewer']
        );

        self::assertSame($scenario['collectStep'], $payload['collectStep']);
        self::assertSame(
            $expectedHubCalls > 0 ? ['hub', 'flush'] : ['flush'],
            $events
        );
    }

    /**
     * @return iterable<string, array{string, bool, int}>
     */
    public static function hubDateUpdateCases(): iterable
    {
        yield 'public consultation with changed dates' => ['public-consultation', true, 1];
        yield 'public inquiry with changed dates' => ['public-inquiry', true, 1];
        yield 'other project type with changed dates' => ['other', true, 0];
        yield 'public consultation with unchanged dates' => ['public-consultation', false, 0];
    }

    public function testConvertsHubErrorToGraphQLException(): void
    {
        $events = [];
        $scenario = $this->createScenario('public-consultation', true, 1, $events, true);

        try {
            ($scenario['mutation'])(
                new Argument([
                    'input' => [
                        'stepId' => 'collect-step',
                        'operationType' => 'EDIT',
                        'startAt' => '2026-09-22 10:00:00',
                        'endAt' => '2026-10-01 18:00:00',
                    ],
                ]),
                $scenario['viewer']
            );
            self::fail('Expected the Hub error to be converted to a GraphQLException.');
        } catch (GraphQLException $exception) {
            self::assertSame(
                'La mise à jour des dates de consultation dans le Hub API Green a échoué. Réessayez.',
                $exception->getErrors()[0]->getMessage()
            );
        }
    }

    /**
     * @dataProvider vocalContributionActivationCases
     */
    public function testRefusesVocalContributionActivationOnlyWhenFeatureIsDisabled(
        bool $isFeatureActive,
        bool $isAlreadyEnabled,
        bool $isRefused
    ): void {
        $collectStep = $this->createMock(CollectStep::class);
        $collectStep->method('isVocalContributionEnabled')->willReturn($isAlreadyEnabled);
        $viewer = $this->createMock(User::class);
        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $globalIdResolver->method('resolve')->willReturn($collectStep);
        $toggleManager = $this->createMock(Manager::class);
        $toggleManager->method('isActive')->with(Manager::vocal_contribution)->willReturn($isFeatureActive);

        // The form is the next step of the mutation: reaching it means the input was accepted
        $formFactory = $this->createMock(FormFactoryInterface::class);
        $formFactory
            ->expects($isRefused ? $this->never() : $this->once())
            ->method('create')
            ->willThrowException(new \LogicException('Form reached'))
        ;

        $mutation = new UpdateCollectStepMutation(
            globalIdResolver: $globalIdResolver,
            em: $this->createMock(EntityManagerInterface::class),
            authorizationChecker: $this->createMock(AuthorizationCheckerInterface::class),
            formFactory: $formFactory,
            logger: $this->createMock(LoggerInterface::class),
            proposalStepSplitViewService: $this->createMock(ProposalStepSplitViewService::class),
            actionLogger: $this->createMock(ActionLogger::class),
            hubApiGreenClient: $this->createMock(HubApiGreenClient::class),
            hubMetadataRepository: $this->createMock(HubMetadataRepository::class),
            hubDocumentsStepGuard: new HubDocumentsStepGuard($toggleManager),
            collectStepRepository: $this->createMock(CollectStepRepository::class),
            toggleManager: $toggleManager,
        );

        $this->expectException($isRefused ? UserError::class : \LogicException::class);
        $mutation(
            new Argument([
                'input' => [
                    'stepId' => 'collect-step',
                    'operationType' => 'EDIT',
                    'isVocalContributionEnabled' => true,
                ],
            ]),
            $viewer
        );
    }

    /**
     * @return iterable<string, array{bool, bool, bool}>
     */
    public static function vocalContributionActivationCases(): iterable
    {
        yield 'activation with the feature disabled' => [false, false, true];
        yield 'activation with the feature enabled' => [true, false, false];
        yield 'already enabled step with the feature disabled' => [false, true, false];
    }

    /**
     * @param list<string> $events
     *
     * @return array{
     *     mutation: UpdateCollectStepMutation,
     *     collectStep: CollectStep,
     *     viewer: User,
     * }
     */
    private function createScenario(
        string $projectTypeSlug,
        bool $datesChanged,
        int $expectedHubCalls,
        array &$events,
        bool $hubFailure = false
    ): array {
        $oldStartAt = new \DateTime('2026-09-21 10:00:00');
        $oldEndAt = new \DateTime('2026-09-30 18:00:00');
        $newStartAt = new \DateTime('2026-09-22 10:00:00');
        $newEndAt = new \DateTime('2026-10-01 18:00:00');

        $projectType = $this->createMock(ProjectType::class);
        $projectType->method('getSlug')->willReturn($projectTypeSlug);
        $project = $this->createMock(Project::class);
        $project->method('getProjectType')->willReturn($projectType);

        $collectStep = $this->createMock(CollectStep::class);
        $collectStep->method('getId')->willReturn('collect-step');
        $collectStep->method('getProject')->willReturn($project);
        $collectStep->method('getStartAt')->willReturnOnConsecutiveCalls($oldStartAt, $datesChanged ? $newStartAt : $oldStartAt);
        $collectStep->method('getEndAt')->willReturnOnConsecutiveCalls($oldEndAt, $datesChanged ? $newEndAt : $oldEndAt);

        $hubMetadata = $this->createMock(HubMetadata::class);
        $hubMetadata->method('isEnabled')->willReturn(true);
        $hubMetadata->method('isComplete')->willReturn(true);
        $form = $this->createMock(FormInterface::class);
        $form
            ->expects($this->once())
            ->method('submit')
            ->with([
                'startAt' => $datesChanged ? '2026-09-22 10:00:00' : '2026-09-21 10:00:00',
                'endAt' => $datesChanged ? '2026-10-01 18:00:00' : '2026-09-30 18:00:00',
            ], false)
        ;
        $form->method('isValid')->willReturn(true);

        $viewer = $this->createMock(User::class);
        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $globalIdResolver
            ->expects($this->once())
            ->method('resolve')
            ->with('collect-step', $viewer)
            ->willReturn($collectStep)
        ;

        $formFactory = $this->createMock(FormFactoryInterface::class);
        $formFactory
            ->expects($this->once())
            ->method('create')
            ->with(CollectStepFormType::class, $collectStep)
            ->willReturn($form)
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $flushExpectation = $entityManager
            ->expects($hubFailure ? $this->never() : $this->once())
            ->method('flush')
        ;
        if (!$hubFailure) {
            $flushExpectation->willReturnCallback(static function () use (&$events): void {
                $events[] = 'flush';
            });
        }

        $toggleManager = $this->createMock(Manager::class);
        $toggleManager->expects($this->exactly($datesChanged ? 1 : 0))
            ->method('isActive')
            ->willReturnCallback(static fn (string $toggle): bool => Manager::hub_api_green === $toggle)
        ;

        $hubMetadataRepository = $this->createMock(HubMetadataRepository::class);
        $hubMetadataRepository
            ->expects($expectedHubCalls > 0 ? $this->once() : $this->never())
            ->method('findOneByProject')
            ->with($project)
            ->willReturn($hubMetadata)
        ;

        $hubApiGreenClient = $this->createMock(HubApiGreenClient::class);
        $hubExpectation = $hubApiGreenClient
            ->expects($this->exactly($expectedHubCalls))
            ->method('updateConsultationDates')
            ->with($collectStep, $hubMetadata)
        ;
        if ($hubFailure) {
            $hubExpectation->willReturnCallback(static function () use (&$events): void {
                $events[] = 'hub';

                throw new \RuntimeException('Hub refused the update.');
            });
        } elseif ($expectedHubCalls > 0) {
            $hubExpectation->willReturnCallback(static function () use (&$events): void {
                $events[] = 'hub';
            });
        }

        return [
            'mutation' => new UpdateCollectStepMutation(
                globalIdResolver: $globalIdResolver,
                em: $entityManager,
                authorizationChecker: $this->createMock(AuthorizationCheckerInterface::class),
                formFactory: $formFactory,
                logger: $this->createMock(LoggerInterface::class),
                proposalStepSplitViewService: $this->createMock(ProposalStepSplitViewService::class),
                actionLogger: $this->createMock(ActionLogger::class),
                hubApiGreenClient: $hubApiGreenClient,
                hubMetadataRepository: $hubMetadataRepository,
                hubDocumentsStepGuard: new HubDocumentsStepGuard($toggleManager),
                toggleManager: $toggleManager,
                collectStepRepository: $this->createMock(CollectStepRepository::class),
            ),
            'collectStep' => $collectStep,
            'viewer' => $viewer,
        ];
    }
}
