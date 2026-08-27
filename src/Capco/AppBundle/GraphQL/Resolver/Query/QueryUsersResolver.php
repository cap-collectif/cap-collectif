<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\SortField;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Search\UserSearch;
use Capco\UserBundle\Repository\UserRepository;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class QueryUsersResolver implements QueryInterface
{
    use ResolverTrait;

    protected $userRepo;

    public function __construct(
        UserRepository $userRepo,
        private QueryAnalyzer $queryAnalyzer,
        private UserSearch $userSearch,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->userRepo = $userRepo;
    }

    public function __invoke(Argument $args, ResolveInfo $resolveInfo): ConnectionInterface
    {
        $this->protectArguments($args);
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        $isAdmin = $this->authorizationChecker->isGranted(UserRole::ROLE_ADMIN);
        $includeSuperAdmin = $isAdmin && isset($args['superAdmin']) && true === $args['superAdmin'];
        $includeDisabled = $isAdmin && isset($args['withDisabled']) && true === $args['withDisabled'];
        $emailConfirmed = $isAdmin ? $args['emailConfirmed'] : null;
        $consentInternalCommunication = $isAdmin ? $args['consentInternalCommunication'] : null;
        $onlyProjectAdmins = $isAdmin ? $args['onlyProjectAdmins'] : null;

        $orderBy = $args->offsetExists('orderBy')
            ? $args->offsetGet('orderBy')
            : ['field' => SortField::CREATED_AT, 'direction' => OrderDirection::DESC];

        $paginator = new ElasticsearchPaginator(fn (?string $cursor, int $limit) => $this->userSearch->getAllUsers(
            $limit,
            $orderBy,
            $cursor,
            $includeSuperAdmin,
            $includeDisabled,
            $emailConfirmed,
            $consentInternalCommunication,
            $onlyProjectAdmins
        ));

        return $paginator->auto($args);
    }
}
