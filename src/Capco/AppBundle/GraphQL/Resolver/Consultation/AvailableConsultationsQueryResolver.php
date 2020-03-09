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

    public function __invoke(): array
    {
        return $this->consultationRepository->findBy(['step' => null]);
    }
}
