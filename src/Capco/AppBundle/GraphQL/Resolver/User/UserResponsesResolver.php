<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserResponsesResolver implements ResolverInterface
{
    use ResponsesResolverTrait;

    private ConnectionBuilder $builder;

    public function __construct(ConnectionBuilder $builder)
    {
        $this->builder = $builder;
    }

    public function __invoke(User $user, $viewer, \ArrayObject $context)
    {
        return $this->builder->connectionFromArray(
            $this->filterVisibleResponses(
                $user->getResponses(),
                $user,
                $viewer,
                $context
            )->toArray()
        );
    }
}
