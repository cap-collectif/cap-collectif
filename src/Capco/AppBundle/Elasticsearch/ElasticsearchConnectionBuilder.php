<?php

namespace Capco\AppBundle\Elasticsearch;

use Overblog\GraphQLBundle\Definition\ArgumentInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\EdgeInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Connection\Output\PageInfo;
use Overblog\GraphQLBundle\Relay\Connection\PageInfoInterface;

class ElasticsearchConnectionBuilder
{
    /**
     * If set, used to generate the connection object.
     *
     * @var callable
     */
    protected $connectionCallback;

    /**
     * If set, used to generate the edge object.
     *
     * @var callable
     */
    protected $edgeCallback;

    public function __construct(callable $connectionCallback = null, callable $edgeCallback = null)
    {
        $this->connectionCallback = $connectionCallback;
        $this->edgeCallback = $edgeCallback;
    }

    /**
     * A simple function that accepts an array and connection arguments, and returns
     * a connection object for use in GraphQL. It uses array offsets as pagination,
     * so pagination will only work if the array is static.
     *
     * @param array                   $data
     * @param array|ArgumentInterface $args
     *
     * @return ConnectionInterface
     */
    public function connectionFromArray(array $data, $args = []): ConnectionInterface
    {
        return $this->connectionFromArraySlice($data, $args, [
            'sliceStart' => 0,
            'arrayLength' => \count($data)
        ]);
    }

    /**
     * Given a slice (subset) of an array, returns a connection object for use in
     * GraphQL.
     *
     * This function is similar to `connectionFromArray`, but is intended for use
     * cases where you know the cardinality of the connection, consider it too large
     * to materialize the entire array, and instead wish pass in a slice of the
     * total result large enough to cover the range specified in `args`.
     *
     * @param array                   $arraySlice
     * @param array|ArgumentInterface $args
     * @param array                   $meta
     *
     * @return ConnectionInterface
     */
    public function connectionFromArraySlice(
        array $arraySlice,
        $args,
        array $meta
    ): ConnectionInterface {
        $connectionArguments = $this->getOptionsWithDefaults(
            $args instanceof ArgumentInterface ? $args->getArrayCopy() : $args,
            [
                'after' => '',
                'before' => '',
                'first' => null,
                'last' => null
            ]
        );
        $arraySliceMetaInfo = $this->getOptionsWithDefaults($meta, [
            'sliceStart' => 0,
            'arrayLength' => 0
        ]);

        $arraySliceLength = \count($arraySlice);
        $first = $connectionArguments['first'];
        $last = $connectionArguments['last'];
        $sliceStart = $arraySliceMetaInfo['sliceStart'];
        $arrayLength = $arraySliceMetaInfo['arrayLength'];
        $sliceEnd = $sliceStart + $arraySliceLength;
        $startOffset = max($sliceStart - 1, -1) + 1;
        $endOffset = min($sliceEnd, $arrayLength);

        if (is_numeric($first)) {
            if ($first < 0) {
                throw new \InvalidArgumentException(
                    'Argument "first" must be a non-negative integer'
                );
            }
            $endOffset = min($endOffset, $startOffset + $first);
        }

        if (is_numeric($last)) {
            if ($last < 0) {
                throw new \InvalidArgumentException(
                    'Argument "last" must be a non-negative integer'
                );
            }

            $startOffset = max($startOffset, $endOffset - $last);
        }

        // If supplied slice is too large, trim it down before mapping over it.
        $length = $arraySliceLength - ($sliceEnd - $endOffset);
        $slice = \array_slice($arraySlice, 0, $length);
        $edges = $this->createEdges($slice, $meta['cursors']);

        $firstEdge = $edges[0] ?? null;
        $lastEdge = end($edges);
        $lowerBound = 0;
        $upperBound = $arrayLength;

        $pageInfo = new PageInfo(
            $firstEdge instanceof EdgeInterface ? $firstEdge->getCursor() : null,
            $lastEdge instanceof EdgeInterface ? $lastEdge->getCursor() : null,
            null !== $last ? $startOffset > $lowerBound : false,
            null !== $first ? $endOffset < $upperBound : false
        );

        return $this->createConnection($edges, $pageInfo);
    }

    private function createEdges(iterable $slice, array $cursors): array
    {
        $edges = [];

        foreach ($slice as $index => $value) {
            $cursor = ElasticsearchPaginator::encodeCursor($cursors[$index]);
            if ($this->edgeCallback) {
                $edge = ($this->edgeCallback)($cursor, $value, $index);
                if (!($edge instanceof EdgeInterface)) {
                    throw new \InvalidArgumentException(
                        sprintf(
                            'The $edgeCallback of the ConnectionBuilder must return an instance of EdgeInterface'
                        )
                    );
                }
            } else {
                $edge = new Edge($cursor, $value);
            }
            $edges[] = $edge;
        }

        return $edges;
    }

    private function createConnection($edges, PageInfoInterface $pageInfo): ConnectionInterface
    {
        if ($this->connectionCallback) {
            $connection = ($this->connectionCallback)($edges, $pageInfo);
            if (!($connection instanceof ConnectionInterface)) {
                throw new \InvalidArgumentException(
                    sprintf(
                        'The $connectionCallback of the ConnectionBuilder must return an instance of ConnectionInterface'
                    )
                );
            }

            return $connection;
        }

        return new Connection($edges, $pageInfo);
    }

    private function getOptionsWithDefaults(array $options, array $defaults): array
    {
        return $options + $defaults;
    }
}
