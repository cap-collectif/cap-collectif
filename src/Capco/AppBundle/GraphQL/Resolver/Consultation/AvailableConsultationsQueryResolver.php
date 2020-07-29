<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Repository\ConsultationRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class AvailableConsultationsQueryResolver implements ResolverInterface
{
    private $consultationRepository;

    public function __construct(ConsultationRepository $consultationRepository)
    {
        $this->consultationRepository = $consultationRepository;
    }

    public function __invoke(?string $term = null): array
    {
        if (null !== $term) {
            return $this->consultationRepository->searchByTerm($term);
        }

        return $this->consultationRepository->findBy(['step' => null]);
    }
}
