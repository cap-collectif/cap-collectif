<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserEmailResolver implements QueryInterface
{
    public function __invoke(User $user): ?string
    {
        if (0 === strpos($user->getEmail(), 'twitter_')) {
            return null;
        }

        return $user->getEmail();
    }
}
