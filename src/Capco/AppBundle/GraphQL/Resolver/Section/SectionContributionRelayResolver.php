<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Search\OpinionSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SectionContributionRelayResolver implements ResolverInterface
{
    private $opinionSearch;

    public function __construct(OpinionSearch $opinionSearch)
    {
        $this->opinionSearch = $opinionSearch;
    }

    public function __invoke(OpinionType $section, Arg $args): ConnectionInterface
    {
        $totalCount = 0;
        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($args, &$totalCount) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            $filters = [];
            if ($args->offsetExists('trashedStatus')) {
                $filters['trashedStatus'] = $args->offsetGet('trashedStatus');
            }
            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);
            $results = $this->opinionSearch->getByCriteriaOrdered($filters, $order, $limit, $offset);
            $totalCount = (int) $results['count'];
            return $results['opinions'];
        });
        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
