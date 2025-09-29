<?php

namespace Capco\AppBundle\GraphQL\Resolver\ConsultationStep;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ConsultationRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ConsultationStepConsultationsResolver implements QueryInterface
{
    public function __construct(
        private readonly ConsultationRepository $repository
    ) {
    }

    public function __invoke(ConsultationStep $step, Argument $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($step) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            return $this->repository
                ->getByConsultationStepPaginated($step, $offset, $limit)
                ->getIterator()
                ->getArrayCopy()
            ;
        });

        $totalCount = $this->repository->countByStep($step);

        return $paginator->auto($args, $totalCount);
    }
}
