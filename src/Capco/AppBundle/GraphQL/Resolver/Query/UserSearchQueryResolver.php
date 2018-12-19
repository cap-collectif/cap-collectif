<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserSearchQueryResolver implements ResolverInterface
{
    protected $userSearch;

    public function __construct(UserSearch $userSearch)
    {
        $this->userSearch = $userSearch;
    }

    public function __invoke(Argument $args): array
    {
        return $this->userSearch->searchAllUsers($args['displayName'], $args['notInIds']);
    }
}
