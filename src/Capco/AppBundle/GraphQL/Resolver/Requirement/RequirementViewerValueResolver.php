<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class RequirementViewerValueResolver implements ResolverInterface
{
    public function __invoke(Requirement $requirement, User $user)// : mixed
    {
        if (Requirement::FIRSTNAME === $requirement->getType()) {
            return $user->getFirstname();
        }
        if (Requirement::LASTNAME === $requirement->getType()) {
            return $user->getLastname();
        }
        if (Requirement::PHONE === $requirement->getType()) {
            return $user->getPhone();
        }

        if (Requirement::CHECKBOX === $requirement->getType()) {
            return false;
        }
    }
}
