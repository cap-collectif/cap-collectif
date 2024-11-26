<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\CanSetOwner;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;

class SettableOwnerResolver
{
    final public const OWNER_NOT_FOUND = 'OWNER_NOT_FOUND';

    private readonly GlobalIdResolver $resolver;

    public function __construct(GlobalIdResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(?string $ownerId, User $viewer): Owner
    {
        if ($ownerId) {
            $owner = $this->resolver->resolve($ownerId, $viewer);
            if ($owner instanceof Owner && CanSetOwner::check($owner, $viewer)) {
                return $owner;
            }

            throw new UserError(self::OWNER_NOT_FOUND);
        }

        return $viewer;
    }
}
