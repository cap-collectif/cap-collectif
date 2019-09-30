<?php

namespace Capco\AppBundle\Elasticsearch;

use Overblog\GraphQLBundle\Relay\Connection\ConnectionBuilder;
use Overblog\GraphQLBundle\Definition\ArgumentInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ElasticsearchPaginator
{
    public const MODE_REGULAR = false;
    public const ES_PAGINATION = 1;
    public const LEGACY_PAGINATION = 2;

    /** @var callable */
    private $fetcher;

    /** @var bool */
    private $promise;

    /** @var int */
    private $totalCount;

    /** @var ConnectionBuilder */
    private $connectionBuilder;

    /** @var ElasticsearchConnectionBuilder */
    private $elasticsearchConnectionBuilder;

    /**
     * @param callable                            $fetcher
     * @param ElasticsearchConnectionBuilder|null $elasticsearchConnectionBuilder
     * @param ConnectionBuilder                   $connectionBuilder
     */
    public function __construct(
        callable $fetcher,
        ElasticsearchConnectionBuilder $elasticsearchConnectionBuilder = null,
        ConnectionBuilder $connectionBuilder = null
    ) {
        $this->fetcher = $fetcher;
        $this->elasticsearchConnectionBuilder =
            $elasticsearchConnectionBuilder ?: new ElasticsearchConnectionBuilder();
        $this->connectionBuilder = $connectionBuilder ?: new ConnectionBuilder();
    }

    /**
     * @param ArgumentInterface $args
     * @param int|callable      $total
     * @param int               $paginationType
     *
     * @return ConnectionInterface|object A connection or a promise
     */
    public function backward(
        ArgumentInterface $args,
        int $total,
        int $paginationType
    ): ConnectionInterface {
        $total = $this->computeTotalCount($total);
        $limit = $args['last'] ?? null;
        $before = $args['before'] ?? null;
        if (self::LEGACY_PAGINATION === $paginationType) {
            $offset = max(
                0,
                $this->connectionBuilder->getOffsetWithDefault($before, $total) - $limit
            );
            $entities = \call_user_func($this->fetcher, null, $offset, $limit);

            return $this->handleEntities($entities, function ($entities) use (
                $args,
                $offset,
                $total
            ) {
                return $this->connectionBuilder->connectionFromArraySlice($entities, $args, [
                    'sliceStart' => $offset,
                    'arrayLength' => $total
                ]);
            });
        }
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
        $connection->setTotalCount($total);

        return $connection;
    }

    public function forward(ArgumentInterface $args, int $paginationType): ConnectionInterface
    {
        $limit = $args['first'] ?? null;
        $after = $args['after'] ?? null;
        if (self::LEGACY_PAGINATION === $paginationType) {
            $offset = $this->connectionBuilder->getOffsetWithDefault($after, 0);
            // If we don't have a cursor or if it's not valid, then we must not use the slice method
            if (!$after || !is_numeric($this->connectionBuilder->cursorToOffset($after))) {
                $results = \call_user_func(
                    $this->fetcher,
                    null,
                    $offset,
                    $limit ? $limit + 1 : $limit
                );

                return $this->handleEntities($results['entities'], function ($entities) use (
                    $args
                ) {
                    return $this->connectionBuilder->connectionFromArray($entities, $args);
                });
            }
            $results = \call_user_func($this->fetcher, null, $offset, $limit ? $limit + 2 : $limit);

            $connection = $this->handleEntities($results['entities'], function ($entities) use (
                $args,
                $offset,
                $results
            ) {
                return $this->connectionBuilder->connectionFromArraySlice($entities, $args, [
                    'sliceStart' => $offset,
                    'arrayLength' => $offset + \count($results['entities'])
                ]);
            });
            $connection->setTotalCount($results['count']);

            return $connection;
        }
        $cursor = $after;
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

    /**
     * @param ArgumentInterface $args
     * @param int|callable      $total
     * @param string            $paginationType
     *
     * @return ConnectionInterface|object A connection or a promise
     */
    public function auto(
        ArgumentInterface $args,
        int $total,
        string $paginationType
    ): ConnectionInterface {
        if (isset($args['last'])) {
            $connection = $this->backward($args, $total, $paginationType);
            $connection->setTotalCount($this->computeTotalCount($total));
        } else {
            $connection = $this->forward($args, $paginationType);
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
