<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Enum\EventOrderField;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Search\EventSearch;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class QueryEventsResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private EventSearch $eventSearch,
        private LoggerInterface $logger,
        private QueryAnalyzer $queryAnalyzer
    ) {
    }

    public function __invoke(
        Argument $args,
        ResolveInfo $resolveInfo,
        RequestStack $requestStack
    ): ConnectionInterface {
        $this->protectArguments($args);
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        return $this->getEventsConnection($args);
    }

    public function getEventsConnection(Argument $args): ConnectionInterface
    {
        try {
            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $args
            ) {
                $filters = [];
                $search = null;
                $orderBy = $args->offsetExists('orderBy')
                    ? $args->offsetGet('orderBy')
                    : ['field' => EventOrderField::START_AT, 'direction' => OrderDirection::ASC];

                if ($args->offsetExists('theme')) {
                    $filters['themes'] = $args->offsetGet('theme');
                }

                if ($args->offsetExists('district')) {
                    $filters['districts'] = $args->offsetGet('district');
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

                if ($args->offsetExists('enabled')) {
                    // Maybe also check that viewer is an admin
                    $filters['enabled'] = $args->offsetGet('enabled');
                } else {
                    $filters['enabled'] = true;
                }
                if ($args->offsetExists('locale')) {
                    $filters['locale'] = $args->offsetGet('locale');
                }
                if ($args->offsetExists('search')) {
                    $search = $args->offsetGet('search');
                }

                return $this->eventSearch->searchEvents(
                    $cursor,
                    $limit,
                    $search,
                    $filters,
                    $orderBy
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
