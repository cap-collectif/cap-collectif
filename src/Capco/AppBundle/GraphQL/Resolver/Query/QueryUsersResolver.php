<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Search\UserSearch;
use GraphQL\Type\Definition\ResolveInfo;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryUsersResolver implements ResolverInterface
{
    use ResolverTrait;

    protected $userRepo;
    private $queryAnalyzer;
    private $userSearch;

    public function __construct(
        UserRepository $userRepo,
        QueryAnalyzer $queryAnalyzer,
        UserSearch $userSearch
    ) {
        $this->userRepo = $userRepo;
        $this->queryAnalyzer = $queryAnalyzer;
        $this->userSearch = $userSearch;
    }

    public function __invoke(Argument $args, ResolveInfo $resolveInfo): Connection
    {
        $this->protectArguments($args);
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        $includeSuperAdmin = isset($args['superAdmin']) && true === $args['superAdmin'];

        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            $includeSuperAdmin,
            &$totalCount
        ) {
            $users = $this->userSearch->getAllUsers($limit, $offset, $includeSuperAdmin)['results'];
            $totalCount = $users['totalCount'];

            return $users;
        });

        return $paginator->auto($args, $totalCount);
    }
}
