<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserOrganizationsResolver implements ResolverInterface
{
    public function __invoke(User $user): array
    {
        return $user
            ->getMemberOfOrganizations()
            ->map(function (OrganizationMember $organizationMember) {
                return $organizationMember->getOrganization();
            })
            ->toArray()
        ;
    }
}
