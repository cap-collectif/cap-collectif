<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class UserResponsesResolver implements ResolverInterface
{
    public function __invoke(User $viewer)
    {
        return ConnectionBuilder::connectionFromArray($viewer->getResponses()->toArray());
    }
}
