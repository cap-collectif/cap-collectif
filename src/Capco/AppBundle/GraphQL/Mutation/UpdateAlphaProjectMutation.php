<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\Persister\ProjectPersister;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateAlphaProjectMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ProjectPersister $persister,
        private readonly ProjectRepository $projectRepository,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $project = $this->persister->persist($input, $viewer, true);

        $this->invalidateCache($project);

        return ['project' => $project];
    }

    public function invalidateCache(Project $project): void
    {
        $slug = $project->getSlug();
        $cacheDriver = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(ProjectRepository::getOneWithoutVisibilityCacheKey($slug));
    }

    public function isGranted(string $projectId): bool
    {
        $project = $this->projectRepository->find(GlobalId::fromGlobalId($projectId)['id']);

        if ($project) {
            return $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $project);
        }

        return false;
    }
}
