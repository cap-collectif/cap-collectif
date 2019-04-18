<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ConsultationSectionResolver implements ResolverInterface
{
    public function __invoke(Consultation $consultation, Arg $argument): \Traversable
    {
        /** @var Collection $sections */
        $sections = $consultation->getOpinionTypes();

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
