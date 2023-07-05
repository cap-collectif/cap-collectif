<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ConsultationSectionResolver implements ResolverInterface
{
    public function __invoke(Consultation $consultation, Arg $argument): array
    {
        /** @var Collection $sections */
        $sections = $consultation->getOpinionTypes();

        $iterator = $sections->getIterator();
        $sectionsArray = iterator_to_array($iterator);

        if ($sections) {
            $iterator = $sections
                ->filter(function (OpinionType $section) {
                    return null === $section->getParent();
                })
                ->getIterator()
            ;

            $sectionsArray = iterator_to_array($iterator);

            // define ordering closure, using preferred comparison method/field
            usort($sectionsArray, function ($first, $second) {
                return (int) $first->getPosition() > (int) $second->getPosition() ? 1 : -1;
            });
        }

        return $sectionsArray;
    }
}
