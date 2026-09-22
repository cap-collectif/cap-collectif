<?php

namespace CapcoTests\Mutation;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Form\Step\CollectStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\UpdateCollectStepMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Service\ProposalStepSplitViewService;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
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
        $scenario = $this->createScenario($projectTypeSlug, $datesChanged, $expectedHubCalls);
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
        $scenario = $this->createScenario('public-consultation', true, 1, true);

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
        $hubStep = $this->createMock(OtherStep::class);
        $hubStep->method('getHubMetadata')->willReturn($hubMetadata);
        $project->method('getRealSteps')->willReturn([$hubStep]);

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

        $toggleManager = $this->createMock(Manager::class);
        $toggleManager
            ->expects($this->once())
            ->method('isActive')
            ->with(Manager::hub_api_green)
            ->willReturn(true)
        ;

        $hubApiGreenClient = $this->createMock(HubApiGreenClient::class);
        $hubExpectation = $hubApiGreenClient
            ->expects($this->exactly($expectedHubCalls))
            ->method('updateConsultationDates')
            ->with($collectStep, $hubMetadata)
        ;
        if ($hubFailure) {
            $hubExpectation->willThrowException(new \RuntimeException('Hub refused the update.'));
        }

        return [
            'mutation' => new UpdateCollectStepMutation(
                globalIdResolver: $globalIdResolver,
                em: $this->createMock(EntityManagerInterface::class),
                authorizationChecker: $this->createMock(AuthorizationCheckerInterface::class),
                formFactory: $formFactory,
                logger: $this->createMock(LoggerInterface::class),
                proposalStepSplitViewService: $this->createMock(ProposalStepSplitViewService::class),
                actionLogger: $this->createMock(ActionLogger::class),
                hubApiGreenClient: $hubApiGreenClient,
                toggleManager: $toggleManager,
            ),
            'collectStep' => $collectStep,
            'viewer' => $viewer,
        ];
    }
}
