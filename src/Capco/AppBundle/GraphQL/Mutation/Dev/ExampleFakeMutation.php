<?php

namespace Capco\AppBundle\GraphQL\Mutation\Dev;

use Capco\AppBundle\GraphQL\Resolver\Dev\AbstractFakeResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class ExampleFakeMutation extends AbstractFakeResolver implements MutationInterface
{
    public function __invoke(Argument $arg): User
    {
        return $this->getFromClass(User::class, 10)[0];
    }
}
