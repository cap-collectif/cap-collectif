<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\UpdateProjectSlugMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectUrlResolver;
use Capco\AppBundle\Repository\HubMetadataRepository;
use Capco\AppBundle\Service\HubDocumentsStepGuard;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\String\Slugger\AsciiSlugger;

/**
 * @internal
 * @coversNothing
 */
class UpdateProjectSlugMutationTest extends TestCase
{
    public function testSynchronizesHubUrlBeforeFlushingTheProjectSlug(): void
    {
        $project = $this->createMock(Project::class);
        $project->expects($this->once())->method('getSlug')->willReturn('old-slug');
        $project->expects($this->once())->method('setSlug')->with('new-slug');

        $metadata = $this->createCompleteMetadata();
        $hubMetadataRepository = $this->createMock(HubMetadataRepository::class);
        $hubMetadataRepository->expects($this->once())->method('findOneByProject')->with($project)->willReturn($metadata);

        $hubUpdated = false;
        $hubApiGreenClient = $this->createMock(HubApiGreenClient::class);
        $hubApiGreenClient
            ->expects($this->once())
            ->method('updateConsultationUrl')
            ->with('https://platform.example/project/new-slug', $metadata)
            ->willReturnCallback(static function () use (&$hubUpdated): void {
                $hubUpdated = true;
            })
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('flush')->willReturnCallback(static function () use (&$hubUpdated): void {
            TestCase::assertTrue($hubUpdated);
        });

        $mutation = $this->createMutation(
            project: $project,
            entityManager: $entityManager,
            hubApiGreenClient: $hubApiGreenClient,
            hubMetadataRepository: $hubMetadataRepository
        );

        $payload = $mutation($this->argument(), $this->createMock(User::class));

        self::assertSame($project, $payload['project']);
        self::assertNull($payload['errorCode']);
    }

    public function testHubFailureRejectsSlugUpdateBeforeFlushingTheProject(): void
    {
        $project = $this->createMock(Project::class);
        $project->method('getSlug')->willReturn('old-slug');
        $project->expects($this->once())->method('setSlug')->with('new-slug');

        $metadata = $this->createCompleteMetadata();
        $hubMetadataRepository = $this->createMock(HubMetadataRepository::class);
        $hubMetadataRepository->method('findOneByProject')->willReturn($metadata);

        $hubApiGreenClient = $this->createMock(HubApiGreenClient::class);
        $hubApiGreenClient
            ->expects($this->once())
            ->method('updateConsultationUrl')
            ->willThrowException(new \RuntimeException('Hub refused the update.'))
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->never())->method('flush');

        $mutation = $this->createMutation(
            project: $project,
            entityManager: $entityManager,
            hubApiGreenClient: $hubApiGreenClient,
            hubMetadataRepository: $hubMetadataRepository
        );

        try {
            $mutation($this->argument(), $this->createMock(User::class));
            self::fail('Expected a GraphQL exception.');
        } catch (GraphQLException $exception) {
            self::assertSame(
                'La mise à jour du permalien dans le Hub API Green a échoué. Réessayez.',
                $exception->getErrors()[0]->getMessage()
            );
        }
    }

    private function createCompleteMetadata(): HubMetadata
    {
        $metadata = $this->createMock(HubMetadata::class);
        $metadata->method('isEnabled')->willReturn(true);
        $metadata->method('isComplete')->willReturn(true);

        return $metadata;
    }

    private function argument(): Argument
    {
        return new Argument([
            'input' => [
                'projectId' => 'project-id',
                'slug' => 'new slug',
            ],
        ]);
    }

    private function createMutation(
        Project $project,
        EntityManagerInterface $entityManager,
        HubApiGreenClient $hubApiGreenClient,
        HubMetadataRepository $hubMetadataRepository
    ): UpdateProjectSlugMutation {
        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $globalIdResolver->expects($this->once())->method('resolve')->with('project-id', $this->isInstanceOf(User::class))->willReturn($project);

        $hubDocumentsStepGuard = $this->createMock(HubDocumentsStepGuard::class);
        $hubDocumentsStepGuard->expects($this->once())->method('isProtectedDocumentsProject')->with($project)->willReturn(true);

        $projectUrlResolver = $this->createMock(ProjectUrlResolver::class);
        $projectUrlResolver->expects($this->once())->method('__invoke')->with($project)->willReturn('https://platform.example/project/new-slug');

        return new UpdateProjectSlugMutation(
            em: $entityManager,
            globalIdResolver: $globalIdResolver,
            slugger: new AsciiSlugger(),
            authorizationChecker: $this->createMock(AuthorizationCheckerInterface::class),
            hubApiGreenClient: $hubApiGreenClient,
            hubMetadataRepository: $hubMetadataRepository,
            hubDocumentsStepGuard: $hubDocumentsStepGuard,
            projectUrlResolver: $projectUrlResolver,
            logger: $this->createMock(LoggerInterface::class)
        );
    }
}
