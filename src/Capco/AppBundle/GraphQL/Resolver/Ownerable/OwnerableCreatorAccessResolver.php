<?php

namespace Capco\AppBundle\GraphQL\Resolver\Ownerable;

use Capco\AppBundle\Entity\Interfaces\CreatableInterface;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\Organization\OrganizationAdminAccessResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class OwnerableCreatorAccessResolver implements QueryInterface
{
    private OrganizationAdminAccessResolver $organizationAdminAccessResolver;

    public function __construct(OrganizationAdminAccessResolver $organizationAdminAccessResolver)
    {
        $this->organizationAdminAccessResolver = $organizationAdminAccessResolver;
    }

    public function __invoke(Ownerable $entity, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        if ($viewer->isAdmin()) {
            return true;
        }
        if ($entity instanceof CreatableInterface && $entity->getCreator() === $viewer) {
            return true;
        }
        $owner = $entity->getOwner();
        if ($owner instanceof Organization) {
            return $this->organizationAdminAccessResolver->__invoke($owner, $viewer);
        }

        return false;
    }
}
