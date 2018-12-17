<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ConsultationContributionsConnectionResolver implements ResolverInterface
{
    private $opinionRepo;

    public function __construct(OpinionRepository $opinionRepo)
    {
        $this->opinionRepo = $opinionRepo;
    }

    public function __invoke(ConsultationStep $consultation, Argument $args): Connection
    {
        $includeTrashed = $args->offsetGet('includeTrashed');

        $paginator = new Paginator(function ($offset, $limit) use (
            $consultation,
            $args,
            $includeTrashed
        ) {
            $criteria = ['step' => $consultation, 'trashed' => false];

            if ($includeTrashed) {
                unset($criteria['trashed']);
            }

            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            $orderBy = [$field => $direction];

            return $this->opinionRepo
                ->getByCriteriaOrdered($criteria, $orderBy, $limit, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $this->opinionRepo->countByStep($consultation, $includeTrashed);

        return $paginator->auto($args, $totalCount);
    }
}
