<?php

namespace Capco\AppBundle\GraphQL\Resolver\ConsultationStep;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Search\OpinionSearch;
use Capco\AppBundle\Search\Search;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ConsultationStepContributionsConnectionResolver implements ResolverInterface
{
    private $opinionSearch;

    public function __construct(OpinionSearch $opinionSearch)
    {
        $this->opinionSearch = $opinionSearch;
    }

    public function __invoke(
        ConsultationStep $consultationStep,
        Argument $args,
        $viewer,
        RequestStack $request
    ): ConnectionInterface {
        $paginator = new ElasticsearchPaginator(function (?string $cursor, $limit) use (
            $consultationStep,
            $args,
            $viewer,
            $request
        ) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $includeTrashed = $args->offsetGet('includeTrashed');
            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);
            $filters = [
                'step.id' => $consultationStep->getId(),
                'trashed' => false,
                'published' => true
            ];
            $seed = Search::generateSeed($request, $viewer);

            if ($includeTrashed) {
                unset($filters['trashed']);
            }

            return $this->opinionSearch->getByCriteriaOrdered(
                $filters,
                $order,
                $limit,
                $cursor,
                $viewer,
                $seed
            );
        });

        return $paginator->auto($args);
    }
}
