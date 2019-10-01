<?php

namespace Capco\AppBundle\Elasticsearch;

use Overblog\GraphQLBundle\Definition\ArgumentInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ElasticsearchPaginator
{
    /** @var callable */
    private $fetcher;

    /** @var int */
    private $totalCount;

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
        $results = \call_user_func($this->fetcher, $cursor, null, $limit ? $limit + 2 : $limit);

        $connection = $this->handleEntities($results['entities'], function ($entities) use (
            $args,
            $results
        ) {
            return $this->elasticsearchConnectionBuilder->connectionFromArraySlice(
                $entities,
                $args,
                [
                    'sliceStart' => 0,
                    'arrayLength' => \count($results['entities']),
                    'cursors' => $results['cursors']
                ]
            );
        });
        $connection->setTotalCount($results['count']);

        return $connection;
    }

    public function forward(ArgumentInterface $args): ConnectionInterface
    {
        $limit = $args['first'] ?? null;
        $after = $args['after'] ?? null;
        $cursor = $after;
        $results = \call_user_func($this->fetcher, $cursor, $limit ? $limit + 2 : $limit);

        $connection = $this->handleEntities($results['entities'], function ($entities) use (
            $args,
            $results
        ) {
            return $this->elasticsearchConnectionBuilder->connectionFromArraySlice(
                $entities,
                $args,
                [
                    'sliceStart' => 0,
                    'arrayLength' => \count($results['entities']),
                    'cursors' => $results['cursors']
                ]
            );
        });
        $connection->setTotalCount($results['count']);

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

    /**
     * @param int|callable $total
     * @param array        $callableArgs
     *
     * @return int|mixed
     */
    private function computeTotalCount($total, array $callableArgs = []): int
    {
        if (null !== $this->totalCount) {
            return $this->totalCount;
        }

        $this->totalCount = \is_callable($total)
            ? \call_user_func_array($total, $callableArgs)
            : $total;

        return $this->totalCount;
    }
}
