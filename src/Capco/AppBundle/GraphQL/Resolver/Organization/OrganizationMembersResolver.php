<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class OrganizationMembersResolver implements ResolverInterface
{

    // TODO @TeaAlex extract this in a service
    private function isViewerAdminOrOrganizationAdmin(Organization $organization, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        if ($viewer && $viewer->isAdmin()) {
            return true;
        }

        $member = $organization->getMembership($viewer);

        if (!$member) {
            return false;
        }

        return OrganizationMemberRoleType::ADMIN === $member->getRole();
    }

    public function __invoke(Organization $organization, ?User $viewer = null)
    {
        if (!$this->isViewerAdminOrOrganizationAdmin($organization, $viewer)) {
           return null;
        }

        return $organization->getMembers();
    }
}
