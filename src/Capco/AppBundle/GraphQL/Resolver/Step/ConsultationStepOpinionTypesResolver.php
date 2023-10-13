<?php

declare(strict_types=1);

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ConsultationStepOpinionTypesResolver implements ResolverInterface
{
    public function __invoke(ConsultationStep $consultationStep): array
    {
        if (null === $consultationStep->getFirstConsultation()) {
            return [];
        }

        return $consultationStep->getFirstConsultation()->getOpinionTypes()->toArray();
    }
}
