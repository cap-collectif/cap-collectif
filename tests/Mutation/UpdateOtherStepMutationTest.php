<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Form\Step\OtherStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\UpdateOtherStepMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Step\StepAccessResolver;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Service\HubDocumentsStepGuard;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormErrorIterator;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

/**
 * @internal
 * @coversNothing
 * @phpunit-status non-compliant
 * @phpunit-reason Invokes GraphQL mutations directly with mocked dependencies instead of verifying the HTTP
 * contract and persisted effects.
 */
class UpdateOtherStepMutationTest extends TestCase
{
    public function testMetadataIsValidatedWhenAssociationIsEnabled(): void
    {
        $step = $this->createMock(OtherStep::class);
        $step->expects($this->once())->method('setTitle')->with('');

        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $viewer = $this->createMock(User::class);
        $globalIdResolver->expects($this->once())->method('resolve')->with('step-id', $viewer)->willReturn($step);

        $form = $this->createMock(FormInterface::class);
        $form
            ->expects($this->once())
            ->method('submit')
            ->with(['hubMetadata' => ['enabled' => true]], false)
        ;
        $form->method('isValid')->willReturn(false);
        $errors = $this->createMock(FormErrorIterator::class);
        $form->method('getErrors')->willReturnCallback(static fn (bool $deep = false) => $deep ? $errors : []);
        $form->method('all')->willReturn([]);
        $errors->method('__toString')->willReturn('metadata is required');

        $formFactory = $this->createMock(FormFactoryInterface::class);
        $formFactory
            ->expects($this->once())
            ->method('create')
            ->with(OtherStepFormType::class, $step, ['hub_metadata_required' => true])
            ->willReturn($form)
        ;

        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->once())->method('error')->with($this->isType('string'));
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->never())->method('flush');

        $mutation = $this->createMutation(
            globalIdResolver: $globalIdResolver,
            entityManager: $entityManager,
            formFactory: $formFactory,
            logger: $logger
        );

        $this->expectException(GraphQLException::class);
        $mutation($this->argument(true), $viewer);
    }

    public function testDisabledAssociationDoesNotCallHubApiGreen(): void
    {
        $scenario = $this->createAssociationScenario(false, false);
        $payload = ($scenario['mutation'])($this->argument(false), $scenario['viewer']);

        self::assertSame($scenario['step'], $payload['step']);
    }

    public function testUnchangedMetadataDoesNotCallHubApiGreen(): void
    {
        $scenario = $this->createAssociationScenario(true, true);
        $payload = ($scenario['mutation'])($this->argument(true), $scenario['viewer']);

        self::assertSame($scenario['step'], $payload['step']);
    }

    public function testEnablingAssociationCallsHubApiGreen(): void
    {
        $scenario = $this->createAssociationScenario(false, true, true);

        $payload = ($scenario['mutation'])($this->argument(true), $scenario['viewer']);

        self::assertSame($scenario['step'], $payload['step']);
    }

    public function testValuesAreNotFlushedWhenHubApiGreenAssociationIsRejected(): void
    {
        $step = $this->createMock(OtherStep::class);
        $step->expects($this->once())->method('setTitle')->with('');
        $step->method('getId')->willReturn('step-id');
        $metadata = $this->createMock(HubMetadata::class);
        $metadata->method('isEnabled')->willReturn(true);
        $metadata->method('isComplete')->willReturn(true);
        $metadata->method('getAiotCode')->willReturnOnConsecutiveCalls('old-aiot', '0003013833');
        $metadata->method('getFolderNumber')->willReturnOnConsecutiveCalls('old-folder', 'T0603151600');
        $metadata->method('getContactEmail')->willReturnOnConsecutiveCalls('old@example.com', 'contact@example.com');
        $step->expects($this->atLeastOnce())->method('getHubMetadata')->willReturn($metadata);

        $project = $this->createMock(Project::class);
        $project->method('getTitle')->willReturn('Project');
        $step->method('getProject')->willReturn($project);

        $viewer = $this->createMock(User::class);
        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $globalIdResolver->method('resolve')->with('step-id', $viewer)->willReturn($step);

        $form = $this->createMock(FormInterface::class);
        $form->expects($this->once())->method('submit')->with(['hubMetadata' => ['enabled' => true]], false);
        $form->method('isValid')->willReturn(true);
        $formFactory = $this->createMock(FormFactoryInterface::class);
        $formFactory
            ->expects($this->once())
            ->method('create')
            ->with(OtherStepFormType::class, $step, ['hub_metadata_required' => true])
            ->willReturn($form)
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->never())->method('persist');
        $entityManager->expects($this->never())->method('flush');

        $toggleManager = $this->createMock(Manager::class);
        $toggleManager->method('isActive')->with(Manager::hub_api_green)->willReturn(true);
        $projectUrlResolver = $this->createMock(ProjectUrlResolver::class);
        $projectUrlResolver->expects($this->once())->method('__invoke')->with($project)->willReturn('project-url');

        $hubApiGreenClient = $this->createMock(HubApiGreenClient::class);
        $hubApiGreenClient
            ->expects($this->once())
            ->method('associateFolder')
            ->with($step, $metadata, 'project-url')
            ->willReturnCallback(static function (): void {
                throw new \RuntimeException('folder "T0603151600" is already associated with AIOT "0003013833"', 409);
            })
        ;

        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->once())->method('error')->with($this->isType('string'), $this->isType('array'));
        $actionLogger = $this->createMock(ActionLogger::class);
        $actionLogger->expects($this->never())->method('logGraphQLMutation');

        $mutation = $this->createMutation(
            globalIdResolver: $globalIdResolver,
            entityManager: $entityManager,
            formFactory: $formFactory,
            logger: $logger,
            actionLogger: $actionLogger,
            hubApiGreenClient: $hubApiGreenClient,
            toggleManager: $toggleManager,
            projectUrlResolver: $projectUrlResolver
        );

        try {
            $mutation($this->argument(true), $viewer);
            self::fail('Expected a GraphQL exception.');
        } catch (GraphQLException $exception) {
            self::assertSame(
                'folder "T0603151600" is already associated with AIOT "0003013833"',
                $exception->getErrors()[0]->getMessage()
            );
        }
    }

    /**
     * @return array{mutation: UpdateOtherStepMutation, step: OtherStep, viewer: User}
     */
    private function createAssociationScenario(bool $previousEnabled, bool $enabled, bool $associateHub = false): array
    {
        $step = $this->createMock(OtherStep::class);
        $step->expects($this->once())->method('setTitle')->with('');
        $step->method('getId')->willReturn('step-id');
        $step->method('getTitle')->willReturn('');

        $metadata = $this->createMock(HubMetadata::class);
        $metadata->method('isEnabled')->willReturnOnConsecutiveCalls($previousEnabled, $enabled, $enabled, $enabled);
        $metadata->method('isComplete')->willReturn($enabled);
        $metadata->method('getAiotCode')->willReturn('0003013833');
        $metadata->method('getFolderNumber')->willReturn('T0603151600');
        $metadata->method('getContactEmail')->willReturn('contact@example.com');
        $step->method('getHubMetadata')->willReturn($metadata);

        $project = $this->createMock(Project::class);
        $project->method('getTitle')->willReturn('Project');
        $step->method('getProject')->willReturn($project);

        $viewer = $this->createMock(User::class);
        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $globalIdResolver->method('resolve')->with('step-id', $viewer)->willReturn($step);

        $form = $this->createMock(FormInterface::class);
        $form->expects($this->once())->method('submit')->with(['hubMetadata' => ['enabled' => $enabled]], false);
        $form->method('isValid')->willReturn(true);
        $formFactory = $this->createMock(FormFactoryInterface::class);
        $formFactory
            ->expects($this->once())
            ->method('create')
            ->with(OtherStepFormType::class, $step, ['hub_metadata_required' => $enabled])
            ->willReturn($form)
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('flush');

        $toggleManager = $this->createMock(Manager::class);
        $toggleManager->expects($this->once())->method('isActive')->with(Manager::hub_api_green)->willReturn(true);

        $hubApiGreenClient = $this->createMock(HubApiGreenClient::class);
        if ($associateHub) {
            $projectUrlResolver = $this->createMock(ProjectUrlResolver::class);
            $projectUrlResolver->expects($this->once())->method('__invoke')->with($project)->willReturn('project-url');
            $hubApiGreenClient
                ->expects($this->once())
                ->method('associateFolder')
                ->with($step, $metadata, 'project-url')
            ;
        } else {
            $hubApiGreenClient->expects($this->never())->method('associateFolder');
            $projectUrlResolver = null;
        }

        $actionLogger = $this->createMock(ActionLogger::class);
        $actionLogger->expects($this->once())->method('logGraphQLMutation');

        return [
            'mutation' => $this->createMutation(
                globalIdResolver: $globalIdResolver,
                entityManager: $entityManager,
                formFactory: $formFactory,
                actionLogger: $actionLogger,
                hubApiGreenClient: $hubApiGreenClient,
                toggleManager: $toggleManager,
                projectUrlResolver: $projectUrlResolver
            ),
            'step' => $step,
            'viewer' => $viewer,
        ];
    }

    private function argument(bool $enabled): Argument
    {
        return new Argument([
            'input' => [
                'stepId' => 'step-id',
                'operationType' => 'EDIT',
                'hubMetadata' => ['enabled' => $enabled],
            ],
        ]);
    }

    private function createMutation(
        ?GlobalIdResolver $globalIdResolver = null,
        ?EntityManagerInterface $entityManager = null,
        ?FormFactoryInterface $formFactory = null,
        ?LoggerInterface $logger = null,
        ?ActionLogger $actionLogger = null,
        ?HubApiGreenClient $hubApiGreenClient = null,
        ?Manager $toggleManager = null,
        ?ProjectUrlResolver $projectUrlResolver = null,
        ?HubDocumentsStepGuard $hubDocumentsStepGuard = null,
        ?StepAccessResolver $stepAccessResolver = null
    ): UpdateOtherStepMutation {
        return new UpdateOtherStepMutation(
            $globalIdResolver ?? $this->createMock(GlobalIdResolver::class),
            $entityManager ?? $this->createMock(EntityManagerInterface::class),
            $formFactory ?? $this->createMock(FormFactoryInterface::class),
            $logger ?? $this->createMock(LoggerInterface::class),
            $actionLogger ?? $this->createMock(ActionLogger::class),
            $hubApiGreenClient ?? $this->createMock(HubApiGreenClient::class),
            $toggleManager ?? $this->createMock(Manager::class),
            $projectUrlResolver ?? $this->createMock(ProjectUrlResolver::class),
            $hubDocumentsStepGuard ?? $this->createMock(HubDocumentsStepGuard::class),
            $stepAccessResolver ?? $this->createMock(StepAccessResolver::class)
        );
    }
}
