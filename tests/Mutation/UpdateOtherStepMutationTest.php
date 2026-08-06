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
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormErrorIterator;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
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
        $step = $this->createMock(OtherStep::class);
        $step->expects($this->once())->method('setTitle')->with('');
        $step->method('getId')->willReturn('step-id');
        $step->method('getTitle')->willReturn('');

        $metadata = $this->createMock(HubMetadata::class);
        $metadata->expects($this->atLeastOnce())->method('isEnabled')->willReturn(false);
        $step->expects($this->atLeastOnce())->method('getHubMetadata')->willReturn($metadata);

        $project = $this->createMock(Project::class);
        $project->method('getTitle')->willReturn('Project');
        $step->method('getProject')->willReturn($project);

        $viewer = $this->createMock(User::class);
        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $globalIdResolver->method('resolve')->with('step-id', $viewer)->willReturn($step);

        $form = $this->createMock(FormInterface::class);
        $form->expects($this->once())->method('submit')->with(['hubMetadata' => ['enabled' => false]], false);
        $form->method('isValid')->willReturn(true);
        $formFactory = $this->createMock(FormFactoryInterface::class);
        $formFactory
            ->expects($this->once())
            ->method('create')
            ->with(OtherStepFormType::class, $step, ['hub_metadata_required' => false])
            ->willReturn($form)
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('persist')->with($step);
        $entityManager->expects($this->once())->method('flush');

        $toggleManager = $this->createMock(Manager::class);
        $toggleManager->expects($this->once())->method('isActive')->with(Manager::hub_api_green)->willReturn(true);

        $hubApiGreenClient = $this->createMock(HubApiGreenClient::class);
        $hubApiGreenClient->expects($this->never())->method('associateFolder');

        $actionLogger = $this->createMock(ActionLogger::class);
        $actionLogger->expects($this->once())->method('logGraphQLMutation');

        $mutation = $this->createMutation(
            globalIdResolver: $globalIdResolver,
            entityManager: $entityManager,
            formFactory: $formFactory,
            actionLogger: $actionLogger,
            hubApiGreenClient: $hubApiGreenClient,
            toggleManager: $toggleManager
        );

        $payload = $mutation($this->argument(false), $viewer);

        self::assertSame($step, $payload['step']);
    }

    public function testValuesAreFlushedBeforeARejectedHubApiGreenAssociation(): void
    {
        $step = $this->createMock(OtherStep::class);
        $step->expects($this->once())->method('setTitle')->with('');
        $step->method('getId')->willReturn('step-id');
        $metadata = $this->createMock(HubMetadata::class);
        $metadata->method('isEnabled')->willReturn(true);
        $metadata->method('isComplete')->willReturn(true);
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

        $flushed = false;
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('persist')->with($step);
        $entityManager->expects($this->once())->method('flush')->willReturnCallback(static function () use (&$flushed): void {
            $flushed = true;
        });

        $toggleManager = $this->createMock(Manager::class);
        $toggleManager->method('isActive')->with(Manager::hub_api_green)->willReturn(true);
        $projectUrlResolver = $this->createMock(ProjectUrlResolver::class);
        $projectUrlResolver->expects($this->once())->method('__invoke')->with($project)->willReturn('project-url');

        $hubApiGreenClient = $this->createMock(HubApiGreenClient::class);
        $hubApiGreenClient
            ->expects($this->once())
            ->method('associateFolder')
            ->with($step, $metadata, 'project-url')
            ->willReturnCallback(static function () use (&$flushed): void {
                TestCase::assertTrue($flushed);

                throw new \RuntimeException('Hub refused the association');
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

        $this->expectException(GraphQLException::class);
        $mutation($this->argument(true), $viewer);
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
        ?ProjectUrlResolver $projectUrlResolver = null
    ): UpdateOtherStepMutation {
        return new UpdateOtherStepMutation(
            $globalIdResolver ?? $this->createMock(GlobalIdResolver::class),
            $entityManager ?? $this->createMock(EntityManagerInterface::class),
            $this->createMock(AuthorizationCheckerInterface::class),
            $formFactory ?? $this->createMock(FormFactoryInterface::class),
            $logger ?? $this->createMock(LoggerInterface::class),
            $actionLogger ?? $this->createMock(ActionLogger::class),
            $hubApiGreenClient ?? $this->createMock(HubApiGreenClient::class),
            $toggleManager ?? $this->createMock(Manager::class),
            $projectUrlResolver ?? $this->createMock(ProjectUrlResolver::class)
        );
    }
}
