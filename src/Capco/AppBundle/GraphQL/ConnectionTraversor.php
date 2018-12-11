<?php

namespace Capco\AppBundle\GraphQL;

use Capco\AppBundle\Utils\Arr;
use Psr\Log\LoggerInterface;
use Overblog\GraphQLBundle\Request\Executor;

class ConnectionTraversor
{
    protected $executor;
    protected $logger;

    public function __construct(Executor $executor, LoggerInterface $logger)
    {
        $this->executor = $executor;
        $this->logger = $logger;
    }

    public function traverseGood(
        array $data,
        string $path,
        callable $callback,
        ?callable $renewalQuery = null
    ): void {
        $copied = $data;
        do {
            $connection =
                Arr::path($copied, $path) ??
                Arr::path($copied, "data.node.${path}") ??
                Arr::path($copied, "data.${path}");
            $edges = Arr::path($connection, 'edges');
            $pageInfo = Arr::path($connection, 'pageInfo');
            $endCursor = $pageInfo['endCursor'];
            if (\count($edges) > 0) {
                foreach ($edges as $edge) {
                    $callback($edge);
                    if ($edge['cursor'] === $endCursor && true === $pageInfo['hasNextPage']) {
                        if (!$renewalQuery) {
                            return;
                        }
                        $copied = $this->executor
                            ->execute('internal', [
                                'query' => $renewalQuery($pageInfo),
                                'variables' => [],
                            ])
                            ->toArray();
                    }
                }
            }
        } while (true === $pageInfo['hasNextPage']);
    }

    public function traverse(
        array &$data,
        string $path,
        callable $callback,
        ?callable $renewalQuery = null,
        ?bool $mutate = false
    ): void {
        do {
            $connection = Arr::path($data, $path);
            $edges = Arr::path($connection, 'edges');
            $pageInfo = Arr::path($connection, 'pageInfo');
            $endCursor = $pageInfo['endCursor'];
            if (\count($edges) > 0) {
                foreach ($edges as $edge) {
                    $callback($edge);
                    if ($edge['cursor'] === $endCursor && true === $pageInfo['hasNextPage']) {
                        if (!$renewalQuery) {
                            return;
                        }
                        if ($mutate) {
                            $data[$path] = $this->executor
                                ->execute('internal', [
                                    'query' => $renewalQuery($pageInfo),
                                    'variables' => [],
                                ])
                                ->toArray();
                        } else {
                            $data = $this->executor
                                ->execute('internal', [
                                    'query' => $renewalQuery($pageInfo),
                                    'variables' => [],
                                ])
                                ->toArray();
                        }
                    }
                }
            }
        } while (true === $pageInfo['hasNextPage']);
    }
}
