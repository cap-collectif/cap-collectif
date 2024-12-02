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
    public function __construct(private readonly ConsultationRepository $consultationRepository)
    {
    }

    public function __invoke(Owner $owner, Argument $args): ConnectionInterface
    {
        $query = $args->offsetGet('query');

        $options = [
            'query' => $query,
        ];

        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->consultationRepository->getByOwner($owner, $offset, $limit, $options)
        );

        return $paginator->auto($args, $this->consultationRepository->countByOwner($owner, $options));
    }
}
