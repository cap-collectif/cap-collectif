<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Enum\ConsultationOrderField;
use Capco\AppBundle\Repository\ConsultationRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ConsultationsQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly ConsultationRepository $consultationRepository
    ) {
    }

    public function __invoke(Arg $args)
    {
        $orderBy = $args['orderBy'] ?? ['direction' => 'ASC', 'field' => 'POSITION'];

        $orderByField = $orderBy['field'] ? ConsultationOrderField::SORT_FIELD[$orderBy['field']] : 'POSITION';
        $orderByDirection = $orderBy['direction'] ?? 'ASC';

        $query = $args['query'] ?? null;

        $totalCount = $this->consultationRepository->count([]);

        if ($args->offsetExists('id')) {
            $globalId = $args->offsetGet('id');
            $consultationId = GlobalId::fromGlobalId($globalId)['id'];
            $consultation = $this->consultationRepository->find($consultationId);

            if (false === $consultation instanceof Consultation) {
                throw new \Exception("No consultation found for the id ${$globalId}");
            }

            $paginator = new Paginator(fn () => [$consultation]);

            return $paginator->auto($args, $totalCount);
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($query, $orderByField, $orderByDirection) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            return $this->consultationRepository
                ->findPaginated($orderByField, $orderByDirection, $offset, $limit, $query)
                ->getIterator()
                ->getArrayCopy()
                ;
        });

        return $paginator->auto($args, $totalCount);
    }
}
