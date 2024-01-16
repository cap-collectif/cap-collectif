<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SectionSectionResolver implements QueryInterface
{
    public function __invoke(OpinionType $type, Arg $argument)
    {
        $iterator = $type->getChildren()->getIterator();

        $typeChildren = iterator_to_array($iterator);

        // define ordering closure, using preferred comparison method/field
        usort($typeChildren, function ($first, $second) {
            return (int) $first->getPosition() > (int) $second->getPosition() ? 1 : -1;
        });

        return $typeChildren;
    }
}
