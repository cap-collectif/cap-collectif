<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ProjectCanEditResolver implements QueryInterface
{
    public function __construct(private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Project $project, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        return $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $project);
    }
}
