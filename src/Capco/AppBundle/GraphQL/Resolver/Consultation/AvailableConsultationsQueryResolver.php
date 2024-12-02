<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Repository\ConsultationRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class AvailableConsultationsQueryResolver implements QueryInterface
{
    public function __construct(private readonly ConsultationRepository $consultationRepository)
    {
    }

    public function __invoke(?string $term = null): array
    {
        if (null !== $term) {
            return $this->consultationRepository->searchByTerm($term);
        }

        return $this->consultationRepository->findBy(['step' => null]);
    }
}
