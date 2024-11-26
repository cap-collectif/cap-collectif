<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Repository\ConsultationRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OrganizationConsultationsResolver implements QueryInterface
{
    private readonly ConsultationRepository $consultationRepository;

    public function __construct(ConsultationRepository $consultationRepository)
    {
        $this->consultationRepository = $consultationRepository;
    }

    public function __invoke(Owner $owner, Argument $args): ConnectionInterface
    {
        $query = $args->offsetGet('query');

        $options = [
            'query' => $query,
        ];

        $paginator = new Paginator(function (int $offset, int $limit) use ($owner, $options) {
            return $this->consultationRepository->getByOwner($owner, $offset, $limit, $options);
        });

        return $paginator->auto($args, $this->consultationRepository->countByOwner($owner, $options));
    }
}
