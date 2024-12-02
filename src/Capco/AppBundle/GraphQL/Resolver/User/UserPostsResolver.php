<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\PostOrderField;
use Capco\AppBundle\Search\PostSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class UserPostsResolver implements QueryInterface
{
    public function __construct(private readonly LoggerInterface $logger, private readonly PostSearch $postSearch)
    {
    }

    public function __invoke(Author $author, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
            ]);
        }

        $affiliations = $args->offsetGet('affiliations') ?? [];
        $query = $args->offsetGet('query') ?? null;
        $orderByField = $args->offsetGet('orderBy')['field'] ?? PostOrderField::UPDATED_AT;
        $orderByDirection = $args->offsetGet('orderBy')['direction'] ?? OrderDirection::DESC;

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $author,
            $affiliations,
            $query,
            $orderByField,
            $orderByDirection
        ) {
            try {
                return $this->postSearch->getUserPostsPaginated(
                    $author,
                    $limit,
                    $affiliations,
                    $cursor,
                    $query,
                    $orderByField,
                    $orderByDirection
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find contributors failed.');
            }
        });

        return $paginator->auto($args);
    }
}
