<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserOrganizationsResolver implements QueryInterface
{
    public function __invoke(User $user): array
    {
        return $user
            ->getMemberOfOrganizations()
            ->map(fn (OrganizationMember $organizationMember) => $organizationMember->getOrganization())
            ->toArray()
        ;
    }
}
