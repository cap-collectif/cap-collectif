<?php

namespace Capco\AppBundle\Elasticsearch;

use Overblog\GraphQLBundle\Relay\Connection\ConnectionBuilder;
use Overblog\GraphQLBundle\Definition\ArgumentInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ElasticsearchPaginator
{
    public const MODE_REGULAR = false;
    public const MODE_PROMISE = true;
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
    /**
     * @var ElasticsearchConnectionBuilder
     */
    private $elasticsearchConnectionBuilder;

    /**
     * @param callable                            $fetcher
     * @param bool                                $promise
     * @param ElasticsearchConnectionBuilder|null $elasticsearchConnectionBuilder
     * @param ConnectionBuilder                   $connectionBuilder
     */
    public function __construct(
        callable $fetcher,
        bool $promise = self::MODE_REGULAR,
        ElasticsearchConnectionBuilder $elasticsearchConnectionBuilder = null,
        ConnectionBuilder $connectionBuilder = null
    ) {
        $this->fetcher = $fetcher;
        $this->promise = $promise;
        $this->elasticsearchConnectionBuilder =
            $elasticsearchConnectionBuilder ?: new ElasticsearchConnectionBuilder();
        $this->connectionBuilder = $connectionBuilder ?: new ConnectionBuilder();
    }

    /**
     * @param ArgumentInterface $args
     * @param int|callable      $total
     * @param array             $callableArgs
     *
     * @return ConnectionInterface|object A connection or a promise
     */
    public function backward(
        ArgumentInterface $args,
        $total,
        array $callableArgs,
        int $paginationType
    ) {
        $total = $this->computeTotalCount($total, $callableArgs);
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

        return $this->handleEntities($results['entities'], function ($entities) use (
            $args,
            $results
        ) {
            return $this->elasticsearchConnectionBuilder->connectionFromArraySlice(
                $entities,
                $args,
                [
                    'sliceStart' => 0,
                    'arrayLength' => 0 + \count($results['entities']),
                    'cursors' => $results['cursors']
                ]
            );
        });
    }

    public function forward(ArgumentInterface $args, int $paginationType)
    {
        $limit = $args['first'] ?? null;
        $after = $args['after'] ?? null;
        if (self::LEGACY_PAGINATION === $paginationType) {
            $offset = $this->connectionBuilder->getOffsetWithDefault($after, 0);
            // If we don't have a cursor or if it's not valid, then we must not use the slice method
            if (!is_numeric($this->connectionBuilder->cursorToOffset($after)) || !$after) {
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

            return $this->handleEntities($results['entities'], function ($entities) use (
                $args,
                $offset,
                $results
            ) {
                return $this->connectionBuilder->connectionFromArraySlice($entities, $args, [
                    'sliceStart' => $offset,
                    'arrayLength' => $offset + \count($results['entities'])
                ]);
            });
        }
        $cursor = $after;
        $results = \call_user_func($this->fetcher, $cursor, null, $limit ? $limit + 2 : $limit);

        return $this->handleEntities($results['entities'], function ($entities) use (
            $args,
            $results
        ) {
            return $this->elasticsearchConnectionBuilder->connectionFromArraySlice(
                $entities,
                $args,
                [
                    'sliceStart' => 0,
                    'arrayLength' => 0 + \count($results['entities']),
                    'cursors' => $results['cursors']
                ]
            );
        });
    }

    /**
     * @param ArgumentInterface $args
     * @param int|callable      $total
     * @param array             $callableArgs
     * @param string            $paginationType
     *
     * @return ConnectionInterface|object A connection or a promise
     */
    public function auto(
        ArgumentInterface $args,
        int $total,
        array $callableArgs,
        string $paginationType
    ) {
        if (isset($args['last'])) {
            $connection = $this->backward($args, $total, $callableArgs, $paginationType);
        } else {
            $connection = $this->forward($args, $paginationType);
        }

        if ($this->promise) {
            return $connection->then(function (ConnectionInterface $connection) use (
                $total,
                $callableArgs
            ) {
                $connection->setTotalCount($this->computeTotalCount($total, $callableArgs));

                return $connection;
            });
        }

        $connection->setTotalCount($this->computeTotalCount($total, $callableArgs));

        return $connection;
    }

    /**
     * @param array|object $entities An array of entities to paginate or a promise
     * @param callable     $callback
     *
     * @return ConnectionInterface|object A connection or a promise
     */
    private function handleEntities($entities, callable $callback)
    {
        if ($this->promise) {
            return $entities->then($callback);
        }

        return \call_user_func($callback, $entities);
    }

    /**
     * @param int|callable $total
     * @param array        $callableArgs
     *
     * @return int|mixed
     */
    private function computeTotalCount($total, array $callableArgs = [])
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
