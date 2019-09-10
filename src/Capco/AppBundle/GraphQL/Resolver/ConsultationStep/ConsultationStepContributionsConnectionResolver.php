<?php

namespace Capco\AppBundle\GraphQL\Resolver\ConsultationStep;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Search\OpinionSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ConsultationStepContributionsConnectionResolver implements ResolverInterface
{
    private $opinionRepo;
    private $opinionSearch;

    public function __construct(OpinionRepository $opinionRepo, OpinionSearch $opinionSearch)
    {
        $this->opinionRepo = $opinionRepo;
        $this->opinionSearch = $opinionSearch;
    }

    public function __invoke(ConsultationStep $consultationStep, Argument $args): ConnectionInterface
    {
        $includeTrashed = $args->offsetGet('includeTrashed');
        $totalCount = 0;
        dump("PLZ BE CalLEd");

        $paginator = new Paginator(function ($offset, $limit) use (
            $consultationStep,
            $args,
            $includeTrashed
        ) {
            $criteria = ['step' => $consultationStep, 'trashed' => false];

            if ($includeTrashed) {
                unset($criteria['trashed']);
            }

            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            $orderBy = [$field => $direction];
//todo
//            $results = $this->opinionSearch->getByCriteriaOrdered();
//            $totalCount = (int) $results['count'];
//            return $results['opinions'];

            return $this->opinionRepo
                ->getByCriteriaOrdered($criteria, $orderBy, $limit, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $this->opinionRepo->countByStep($consultationStep, $includeTrashed);
        return $paginator->auto($args, $totalCount);
    }
}
