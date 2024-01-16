<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserPhoneConfirmationSentAtResolver implements QueryInterface
{
    public function __invoke(User $user): ?\DateTime
    {
        return $user->getSmsConfirmationSentAt();
    }
}
