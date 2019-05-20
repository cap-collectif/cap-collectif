<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class UserResponsesResolver implements ResolverInterface
{
    use ResponsesResolverTrait;

    public function __invoke(User $user, $viewer, \ArrayObject $context)
    {
        return ConnectionBuilder::connectionFromArray(
            $this->filterVisibleResponses(
                $user->getResponses(),
                $user,
                $viewer,
                $context
            )->toArray()
        );
    }
}
