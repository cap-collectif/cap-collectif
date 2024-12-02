<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ProjectExportableSteps implements QueryInterface
{
    public function __construct(private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly ProjectRepository $projectRepository)
    {
    }

    public function __invoke(Project $project): array
    {
        return $project->getExportableSteps();
    }

    public function isGranted(string $projectId): bool
    {
        $project = $this->projectRepository->find($projectId);

        return $this->authorizationChecker->isGranted(ProjectVoter::VIEW, $project);
    }
}
