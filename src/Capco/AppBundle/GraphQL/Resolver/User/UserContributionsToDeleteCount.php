<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Mutation\DeleteAccountMutation;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserContributionsToDeleteCount implements QueryInterface
{
    public function __construct(
        private readonly DeleteAccountMutation $deleteAccountMutation
    ) {
    }

    public function __invoke(User $user): int
    {
        return $this->deleteAccountMutation->countContributionsToDelete($user);
    }
}
