<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class InternalProjectAuthorsResolver implements QueryInterface
{
    public function __construct(private readonly UserRepository $userRepository, protected OrganizationRepository $organizationRepository)
    {
    }

    public function __invoke(Project $project): array
    {
        return array_merge(
            $this->userRepository->findAuthorsByProjectId($project->getId()),
            $this->organizationRepository->findAuthorsByProjectId($project->getId())
        );
    }
}
