<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerMeetsTheRequirementResolver implements ResolverInterface
{
    private $resolver;

    public function __construct(RequirementViewerValueResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(Requirement $requirement, User $user): bool
    {
        $value = $this->resolver->__invoke($requirement, $user);
        if (null === $value) {
            return false;
        }

        if (Requirement::DATE_OF_BIRTH === $requirement->getType()) {
            return true;
        }

        if (\is_string($value)) {
            return true;
        }

        return $value;
    }
}
