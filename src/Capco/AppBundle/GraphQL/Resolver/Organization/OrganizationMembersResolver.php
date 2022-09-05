<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class OrganizationMembersResolver implements ResolverInterface
{
    private OrganizationAdminAccessResolver $organizationAdminAccessResolver;

    public function __construct(OrganizationAdminAccessResolver $organizationAdminAccessResolver)
    {
        $this->organizationAdminAccessResolver = $organizationAdminAccessResolver;
    }

    public function __invoke(Organization $organization, ?User $viewer = null)
    {
        if (!$this->organizationAdminAccessResolver->__invoke($organization, $viewer)) {
           return null;
        }

        return $organization->getMembers();
    }
}
