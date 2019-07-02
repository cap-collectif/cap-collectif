<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Search\EventSearch;
use GraphQL\Type\Definition\ResolveInfo;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryEventsResolver implements ResolverInterface
{
    use ResolverTrait;

    private $eventSearch;
    private $logger;
    private $queryAnalyzer;

    public function __construct(
        EventSearch $eventSearch,
        LoggerInterface $logger,
        QueryAnalyzer $queryAnalyzer
    ) {
        $this->eventSearch = $eventSearch;
        $this->logger = $logger;
        $this->queryAnalyzer = $queryAnalyzer;
    }

    public function __invoke(Argument $args, ResolveInfo $resolveInfo): Connection
    {
        $this->protectArguments($args);
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        return $this->getEventsConnection($args);
    }

    public function getEventsConnection(Argument $args)
    {
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
                    $filters['projects'] = GlobalId::fromGlobalId($args->offsetGet('project'))[
                        'id'
                    ];
                }
                if ($args->offsetExists('isFuture')) {
                    $filters['isFuture'] = $args->offsetGet('isFuture');
                }
                if ($args->offsetExists('userType')) {
                    $filters['userType'] = $args->offsetGet('userType');
                }
                if ($args->offsetExists('author')) {
                    $filters['author'] = $args->offsetGet('author');
                }
                if ($args->offsetExists('isRegistrable')) {
                    $filters['isRegistrable'] = $args->offsetGet('isRegistrable');
                }
                $results = $this->eventSearch->searchEvents(
                    $offset,
                    $limit,
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
