<?php

namespace Capco\AppBundle\GraphQL\Resolver\ConsultationStep;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Search\OpinionSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ConsultationStepContributionsConnectionResolver implements ResolverInterface
{
    private $opinionSearch;

    public function __construct(OpinionSearch $opinionSearch)
    {
        $this->opinionSearch = $opinionSearch;
    }

    public function __invoke(ConsultationStep $consultationStep, Arg $args): ConnectionInterface
    {
        $totalCount = 0;
        $paginator = new Paginator(function ($offset, $limit) use (
            $consultationStep,
            $args,
            &$totalCount
        ) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);
            $filters = ['step.id' => $consultationStep->getId(), 'trashed' => false];
            $includeTrashed = $args->offsetGet('includeTrashed');
            if ($includeTrashed) {
                unset($filters['trashed']);
            }

            $results = $this->opinionSearch->getByCriteriaOrdered(
                $filters,
                $order,
                $limit,
                $offset
            );
            $totalCount = (int) $results['count'];

            return $results['opinions'];
        });
        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
