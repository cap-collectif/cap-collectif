<?php

namespace Capco\AppBundle\GraphQL\Resolver\Dev;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ExampleFakePaginatedResolver extends AbstractFakePaginatedResolver
{
    public function __invoke(Argument $args): ConnectionInterface
    {
        return $this->getPaginated(User::class, $args);
    }
}
