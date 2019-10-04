<?php

namespace Capco\AppBundle\Elasticsearch;

use Overblog\GraphQLBundle\Definition\ArgumentInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ElasticsearchPaginator
{
    /** @var callable */
    private $fetcher;

    /** @var ElasticsearchConnectionBuilder */
    private $elasticsearchConnectionBuilder;

    /**
     * @param callable                            $fetcher
     * @param ElasticsearchConnectionBuilder|null $elasticsearchConnectionBuilder
     */
    public function __construct(
        callable $fetcher,
        ElasticsearchConnectionBuilder $elasticsearchConnectionBuilder = null
    ) {
        $this->fetcher = $fetcher;
        $this->elasticsearchConnectionBuilder =
            $elasticsearchConnectionBuilder ?: new ElasticsearchConnectionBuilder();
    }

    /**
     * @param ArgumentInterface $args
     *
     * @return ConnectionInterface|object A connection or a promise
     */
    public function backward(ArgumentInterface $args): ConnectionInterface
    {
        $limit = $args['last'] ?? null;
        $before = $args['before'] ?? null;
        $cursor = $before;
        /** @var ElasticsearchPaginatedResult $results */
        $results = \call_user_func($this->fetcher, $cursor, null, $limit ? $limit + 1 : $limit);

        $connection = $this->handleEntities($results->getEntities(), function ($entities) use (
            $args,
            $results
        ) {
            return $this->elasticsearchConnectionBuilder->connectionFromArraySlice(
                $entities,
                $args,
                [
                    'sliceStart' => 0,
                    'arrayLength' => \count($results->getEntities()),
                    'cursors' => $results->getCursors()
                ]
            );
        });
        $connection->setTotalCount($results->getTotalCount());

        return $connection;
    }

    public function forward(ArgumentInterface $args): ConnectionInterface
    {
        $limit = $args['first'] ?? null;
        $after = $args['after'] ?? null;
        $cursor = $after;
        /** @var ElasticsearchPaginatedResult $results */
        $results = \call_user_func($this->fetcher, $cursor, $limit ? $limit + 1 : $limit);

        $connection = $this->handleEntities($results->getEntities(), function ($entities) use (
            $args,
            $results
        ) {
            return $this->elasticsearchConnectionBuilder->connectionFromArraySlice(
                $entities,
                $args,
                [
                    'sliceStart' => 0,
                    'arrayLength' => \count($results->getEntities()),
                    'cursors' => $results->getCursors()
                ]
            );
        });
        $connection->setTotalCount($results->getTotalCount());

        return $connection;
    }

    /**
     * @param ArgumentInterface $args
     *
     * @return ConnectionInterface|object A connection or a promise
     */
    public function auto(ArgumentInterface $args): ConnectionInterface
    {
        if (isset($args['last'])) {
            $connection = $this->backward($args);
        } else {
            $connection = $this->forward($args);
        }

        return $connection;
    }

    public static function decodeCursor(string $cursor): array
    {
        return unserialize(base64_decode($cursor), ['allowed_classes' => false]);
    }

    public static function encodeCursor(array $cursor): string
    {
        return base64_encode(serialize($cursor));
    }

    /**
     * @param array|object $entities An array of entities to paginate or a promise
     * @param callable     $callback
     *
     * @return ConnectionInterface|object A connection or a promise
     */
    private function handleEntities($entities, callable $callback): ConnectionInterface
    {
        return $callback($entities);
    }
}
