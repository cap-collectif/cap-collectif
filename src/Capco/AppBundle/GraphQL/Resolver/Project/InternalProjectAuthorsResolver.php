<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class InternalProjectAuthorsResolver implements QueryInterface
{
    protected OrganizationRepository $organizationRepository;
    private UserRepository $userRepository;

    public function __construct(
        UserRepository $userRepository,
        OrganizationRepository $organizationRepository
    ) {
        $this->userRepository = $userRepository;
        $this->organizationRepository = $organizationRepository;
    }

    public function __invoke(Project $project): array
    {
        return array_merge(
            $this->userRepository->findAuthorsByProjectId($project->getId()),
            $this->organizationRepository->findAuthorsByProjectId($project->getId())
        );
    }
}
