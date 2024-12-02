<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\SortField;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Search\UserSearch;
use Capco\UserBundle\Repository\UserRepository;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class QueryUsersResolver implements QueryInterface
{
    use ResolverTrait;

    protected $userRepo;

    public function __construct(
        UserRepository $userRepo,
        private QueryAnalyzer $queryAnalyzer,
        private UserSearch $userSearch
    ) {
        $this->userRepo = $userRepo;
    }

    public function __invoke(Argument $args, ResolveInfo $resolveInfo): ConnectionInterface
    {
        $this->protectArguments($args);
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        $includeSuperAdmin = isset($args['superAdmin']) && true === $args['superAdmin'];
        $includeDisabled = isset($args['withDisabled']) && true === $args['withDisabled'];
        $emailConfirmed = $args['emailConfirmed'];
        $consentInternalCommunication = $args['consentInternalCommunication'];
        $onlyProjectAdmins = $args['onlyProjectAdmins'];

        $orderBy = $args->offsetExists('orderBy')
            ? $args->offsetGet('orderBy')
            : ['field' => SortField::CREATED_AT, 'direction' => OrderDirection::DESC];

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $orderBy,
            $includeSuperAdmin,
            $includeDisabled,
            $emailConfirmed,
            $consentInternalCommunication,
            $onlyProjectAdmins
        ) {
            return $this->userSearch->getAllUsers(
                $limit,
                $orderBy,
                $cursor,
                $includeSuperAdmin,
                $includeDisabled,
                $emailConfirmed,
                $consentInternalCommunication,
                $onlyProjectAdmins
            );
        });

        return $paginator->auto($args);
    }
}
