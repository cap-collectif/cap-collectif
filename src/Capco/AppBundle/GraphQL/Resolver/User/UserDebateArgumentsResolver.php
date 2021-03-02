<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateArgumentsResolver;
use Capco\AppBundle\Search\DebateSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class UserDebateArgumentsResolver implements ResolverInterface
{
    private DebateSearch $debateSearch;

    public function __construct(DebateSearch $debateSearch)
    {
        $this->debateSearch = $debateSearch;
    }

    public function __invoke(?User $viewer, User $user, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $orderBy = DebateArgumentsResolver::getOrderBy($args);

        $totalCount = 0;
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $user,
            $orderBy,
            &$totalCount
        ) {
            $response = $this->debateSearch->searchUserArguments($user, $limit, $orderBy, $cursor);
            $totalCount = $response->getTotalCount();

            return $response;
        });

        $connection = $paginator->auto($args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    private static function canViewerSeeUnpublished(User $user, ?User $viewer): bool
    {
        return $viewer && ($viewer->isAdmin() || $viewer === $user);
    }
}
