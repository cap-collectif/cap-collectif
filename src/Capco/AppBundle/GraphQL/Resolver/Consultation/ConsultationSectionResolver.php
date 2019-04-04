<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ConsultationSectionResolver implements ResolverInterface
{
    public function __invoke(ConsultationStep $consultation, Arg $argument): \Traversable
    {
        /** @var Collection $sections */
        $sections = $consultation->getConsultationStepType()
            ? $consultation->getConsultationStepType()->getOpinionTypes()
            : new ArrayCollection();

        $iterator = $sections->getIterator();

        if ($sections) {
            $iterator = $sections
                ->filter(function (OpinionType $section) {
                    return null === $section->getParent();
                })
                ->getIterator();

            // define ordering closure, using preferred comparison method/field
            $iterator->uasort(function ($first, $second) {
                return (int) $first->getPosition() > (int) $second->getPosition() ? 1 : -1;
            });
        }

        return $iterator;
    }
}
