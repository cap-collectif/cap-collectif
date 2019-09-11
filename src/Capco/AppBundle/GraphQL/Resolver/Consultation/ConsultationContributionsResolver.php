<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ConsultationContributionsResolver implements ResolverInterface
{
    private $opinionRepository;

    public function __construct(
        OpinionRepository $opinionRepository
    ) {
        $this->opinionRepository = $opinionRepository;
    }

    public function __invoke(Consultation $consultation, Argument $args): ConnectionInterface
    {
        $includeTrashed = $args->offsetGet('includeTrashed');

        $paginator = new Paginator(function (int $offset, int $limit) use ($args, $includeTrashed, $consultation) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            $criteria = ['consultation' => $consultation, 'trashed' => false];

            if ($includeTrashed) {
                unset($criteria['trashed']);
            }

            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            $orderBy = [$field => $direction];

            return $this->opinionRepository
                ->getByCriteriaOrdered($criteria, $orderBy, $limit, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        return $paginator->auto(
            $args,
            $this->opinionRepository->countByConsultation($consultation, $includeTrashed)
        );
    }

}
