<?php
namespace Capco\AppBundle\GraphQL;

use Capco\AppBundle\Utils\Arr;
use Capco\AppBundle\Request\Executor;
use Psr\Log\LoggerInterface;

class ConnectionTraversor
{
    protected $executor;
    protected $logger;

    public function __construct(Executor $executor, LoggerInterface $logger)
    {
        $this->executor = $executor;
        $this->logger = $logger;
    }

    public function traverse(
        array &$data,
        string $path,
        callable $callback,
        ?callable $renewalQuery = null
    ): void {
        do {
            $connection = Arr::path($data, $path);
            $edges = Arr::path($connection, 'edges');
            $pageInfo = Arr::path($connection, 'pageInfo');
            $endCursor = $pageInfo['endCursor'];
            if (\count($edges) > 0) {
                foreach ($edges as $edge) {
                    $callback($edge);
                    if ($edge['cursor'] === $endCursor) {
                        if (!$renewalQuery) {
                            return;
                        }
                        $data = $this->executor->execute(null, [
                            'query' => $renewalQuery($pageInfo),
                            'variables' => [],
                        ])->toArray();
                    }
                }
            }
        } while (true === $pageInfo['hasNextPage']);
    }
}
