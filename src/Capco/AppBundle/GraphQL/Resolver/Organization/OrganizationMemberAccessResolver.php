<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class OrganizationMemberAccessResolver implements ResolverInterface
{
    public function __invoke(?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        if ($viewer->isProjectAdmin()) {
            return true;
        }

        if ($viewer->isMediator()) {
            return true;
        }

        return $viewer->isOrganizationMember();
    }
}
