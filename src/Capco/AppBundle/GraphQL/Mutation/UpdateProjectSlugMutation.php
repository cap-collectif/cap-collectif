<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\HubMetadataRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Service\HubDocumentsStepGuard;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

class UpdateProjectSlugMutation implements MutationInterface
{
    use MutationTrait;

    final public const PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly SluggerInterface $slugger,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly HubApiGreenClient $hubApiGreenClient,
        private readonly HubMetadataRepository $hubMetadataRepository,
        private readonly HubDocumentsStepGuard $hubDocumentsStepGuard,
        private readonly ProjectUrlResolver $projectUrlResolver,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $projectId = $input->offsetGet('projectId');

        /** * @var Project $project */
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        if (!$project) {
            return ['errorCode' => self::PROJECT_NOT_FOUND, 'project' => null];
        }

        $previousSlug = $project->getSlug();
        $slug = $this->slugger->slug($input->offsetGet('slug'))->toString();

        $project->setSlug($slug);
        if ($previousSlug !== $slug) {
            $this->synchronizeHubConsultationUrl($project);
        }
        $this->em->flush();

        return ['project' => $project, 'errorCode' => null];
    }

    public function isGranted(string $projectId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        if ($project) {
            return $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $project);
        }

        return false;
    }

    private function synchronizeHubConsultationUrl(Project $project): void
    {
        if (!$this->hubDocumentsStepGuard->isProtectedDocumentsProject($project)) {
            return;
        }

        $hubMetadata = $this->hubMetadataRepository->findOneByProject($project);
        if (!$hubMetadata?->isEnabled() || !$hubMetadata->isComplete()) {
            return;
        }

        try {
            $this->hubApiGreenClient->updateConsultationUrl($this->projectUrlResolver->__invoke($project), $hubMetadata);
        } catch (\RuntimeException $exception) {
            $this->logger->error('Hub API Green consultation URL update failed while updating a project slug.', [
                'projectId' => $project->getId(),
                'exception' => $exception,
            ]);

            throw GraphQLException::fromString(
                'La mise à jour du permalien dans le Hub API Green a échoué. Réessayez.'
            );
        }
    }
}
