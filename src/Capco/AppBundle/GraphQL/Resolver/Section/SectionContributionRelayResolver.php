<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Search\OpinionSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class SectionContributionRelayResolver implements ResolverInterface
{
    private $opinionSearch;

    public function __construct(OpinionSearch $opinionSearch)
    {
        $this->opinionSearch = $opinionSearch;
    }

    public function __invoke(OpinionType $section, Arg $args, $viewer): ConnectionInterface
    {
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $section,
            $args,
            $viewer
        ) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $filters = [];

            if ($args->offsetExists('step')) {
                $filters['step.id'] = $args->offsetGet('step');
            }
            $filters['trashed'] = $args->offsetGet('trashed');
            $filters['type.id'] = $section->getId();

            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);

            return $this->opinionSearch->getByCriteriaOrdered(
                $filters,
                $order,
                $limit,
                $cursor,
                $viewer
            );
        });

        return $paginator->auto($args);
    }
}
