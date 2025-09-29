<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Enum\ForOrAgainstType;
use Capco\AppBundle\Search\VoteSearch;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class DebateVotesResolver implements QueryInterface
{
    public function __construct(
        private readonly VoteSearch $voteSearch,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(
        Debate $debate,
        Argument $args,
        ?User $viewer = null
    ): ConnectionInterface {
        $filters = $this->getFilters($args, $viewer);
        $orderBy = $args->offsetGet('orderBy');
        $paginator = new ElasticsearchPaginator(
            fn (?string $cursor, int $limit) => $this->voteSearch->searchDebateVote(
                $debate,
                $filters,
                $limit,
                $orderBy,
                $cursor
            )
        );

        return $paginator->auto($args);
    }

    private function getFilters(Argument $args, ?User $viewer = null): array
    {
        $filters = [];
        if (null !== $args->offsetGet('type')) {
            try {
                $type = $args->offsetGet('type');
                ForOrAgainstType::checkIsValid($type);
                $filters['voteType'] = $type;
            } catch (UserError $exception) {
                $this->logger->error(__METHOD__ . $exception->getMessage());

                throw $exception;
            }
        }

        if ($args->offsetExists('isPublished')) {
            $filters['published'] = $args->offsetGet('isPublished');
        }

        // An anonymous user or non-admin can only access published data.
        if (null === $viewer || !$viewer->isAdmin()) {
            $filters['published'] = true;
        }

        return $filters;
    }
}
