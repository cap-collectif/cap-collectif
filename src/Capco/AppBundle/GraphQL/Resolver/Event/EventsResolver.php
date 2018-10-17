<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Search\EventSearch;
use Capco\AppBundle\Utils\Text;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class EventsResolver implements ResolverInterface
{
    private $eventSearch;
    private $logger;

    public function __construct(EventSearch $eventSearch, LoggerInterface $logger)
    {
        $this->eventSearch = $eventSearch;
        $this->logger = $logger;
    }

    public function __invoke(Argument $args, RequestStack $request): Connection
    {
        $totalCount = 0;
        $term = null;
        $order = null;
        if ($args->offsetExists('term')) {
            $term = $args->offsetGet('term');
        }
        if ($args->offsetExists('time')) {
            $order = $args->offsetGet('time');
        }
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $args,
                $term,
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
                if ($args->offsetExists('time')) {
                    $filters['time'] = $args->offsetGet('time');
                }

                $seed = Text::random();

                $results = $this->eventSearch->searchEvents(
                    $offset,
                    $limit,
                    $order,
                    $term,
                    $filters,
                    $seed
                );

                $totalCount = $results['count'];

                return $results['events'];
            });

            $connection = $paginator->auto($args, $totalCount);
            $connection->totalCount = $totalCount;
            $connection->{'fusionCount'} = 0;

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Could not find events');
        }
    }
}
