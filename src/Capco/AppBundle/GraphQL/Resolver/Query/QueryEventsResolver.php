<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Search\EventSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryEventsResolver implements ResolverInterface
{
    use ResolverTrait;

    public const FETCH_MORE_TO_AVOID_HAS_NEXT_PAGE_ERROR = 100;
    private $eventSearch;
    private $logger;

    public function __construct(EventSearch $eventSearch, LoggerInterface $logger)
    {
        $this->eventSearch = $eventSearch;
        $this->logger = $logger;
    }

    public function __invoke(Argument $args): Connection
    {
        $this->protectArguments($args);

        $totalCount = 0;
        $search = null;
        $order = null;
        if ($args->offsetExists('search')) {
            $search = $args->offsetGet('search');
        }
        if ($args->offsetExists('isFuture')) {
            $order = $args->offsetGet('isFuture');
        }

        try {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $args,
                $search,
                &$totalCount,
                $order
            ) {
                $filters = [];
                if ($args->offsetExists('theme')) {
                    $filters['themes'] = $args->offsetGet('theme');
                }
                if ($args->offsetExists('project')) {
                    $filters['projects'] = $args->offsetGet('project');
                }
                if ($args->offsetExists('isFuture')) {
                    $filters['isFuture'] = $args->offsetGet('isFuture');
                }
                if ($args->offsetExists('userType')) {
                    $filters['userType'] = $args->offsetGet('userType');
                }

                $results = $this->eventSearch->searchEvents(
                    $offset,
                    $limit + self::FETCH_MORE_TO_AVOID_HAS_NEXT_PAGE_ERROR,
                    $order,
                    $search,
                    $filters
                );

                $totalCount = $results['count'];

                return $results['events'];
            });

            $connection = $paginator->auto($args, $totalCount);
            $connection->totalCount = $totalCount;

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find events');
        }
    }
}
