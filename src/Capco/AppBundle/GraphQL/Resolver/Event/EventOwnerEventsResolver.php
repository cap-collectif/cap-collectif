<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Search\EventSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\EventOrderField;

class EventOwnerEventsResolver implements ResolverInterface
{
    use ResolverTrait;

    private EventSearch $eventSearch;
    private LoggerInterface $logger;

    public function __construct(EventSearch $eventSearch, LoggerInterface $logger)
    {
        $this->eventSearch = $eventSearch;
        $this->logger = $logger;
    }

    public function __invoke(Argument $args, ?User $viewer): ConnectionInterface
    {
        $this->protectArguments($args);

        try {
            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $args,
                $viewer
            ) {
                $filters = [];
                $orderBy = $args->offsetExists('orderBy')
                    ? $args->offsetGet('orderBy')
                    : ['field' => EventOrderField::START_AT, 'direction' => OrderDirection::ASC];

                $search = $args->offsetGet('search') ?? null;
                $affiliations = $args->offsetGet('affiliations') ?? null;
                $filters['status'] = $args->offsetGet('status') ?? null;
                $onlyWhenAuthor = $args->offsetGet('onlyWhenAuthor') ?? false;

                return $this->eventSearch->searchEvents(
                    $cursor,
                    $limit,
                    $search,
                    $filters,
                    $orderBy,
                    $affiliations,
                    $viewer,
                    $onlyWhenAuthor
                );
            });

            return $paginator->auto($args);
        } catch (\RuntimeException $exception) {
            $this->logger->error(
                __METHOD__ .
                    ' : ' .
                    $exception->getMessage() .
                    ' -> ' .
                    var_export($args->getArrayCopy(), true)
            );

            throw new \RuntimeException('Could not find events');
        }
    }
}
