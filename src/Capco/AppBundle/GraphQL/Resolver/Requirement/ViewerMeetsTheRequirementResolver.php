<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerMeetsTheRequirementResolver implements ResolverInterface
{
    public function __invoke(Requirement $requirement, User $user): bool
    {
        return false;
    }
}
