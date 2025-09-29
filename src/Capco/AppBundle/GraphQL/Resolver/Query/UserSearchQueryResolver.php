<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserSearchQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly UserSearch $userSearch
    ) {
    }

    public function __invoke(Argument $args): array
    {
        $onlyUsers = true;

        return $this->userSearch->searchAllUsers(
            $args['displayName'],
            $args['notInIds'],
            $args['authorsOfEventOnly'],
            $onlyUsers,
            $args['isMediatorCompliant']
        );
    }
}
