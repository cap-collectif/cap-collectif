<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

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

    public function __construct(UserRepository $userRepo, QueryAnalyzer $queryAnalyzer)
    {
        $this->userRepo = $userRepo;
        $this->queryAnalyzer = $queryAnalyzer;
    }

    public function __invoke(Argument $args, ResolveInfo $resolveInfo): Connection
    {
        $this->protectArguments($args);
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        $includeSuperAdmin = isset($args['superAdmin']) && true === $args['superAdmin'];

        $paginator = new Paginator(function (int $offset, int $limit) use ($includeSuperAdmin) {
            return $this->userRepo
                ->getAllUsers($limit, $offset, $includeSuperAdmin)
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->userRepo->countAllUsers($includeSuperAdmin);

        return $paginator->auto($args, $totalCount);
    }
}
