<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Enum\JumpsOrderField;
use Capco\AppBundle\Enum\OrderDirection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionJumpsResolver implements ResolverInterface
{
    public function __invoke(AbstractQuestion $question, Arg $args): Collection
    {
        $orderBy = $args->offsetGet('orderBy');
        list($field, $direction) = [$orderBy['field'], $orderBy['direction']];
        $iterator = $question->getJumps()->getIterator();
        $iterator->uasort(static function (LogicJump $a, LogicJump $b) use ($direction, $field) {
            switch ($field) {
                case JumpsOrderField::POSITION:
                    return OrderDirection::ASC === $direction
                        ? $a->getPosition() <=> $b->getPosition()
                        : $b->getPosition() <=> $a->getPosition();
                default:
                    throw new \InvalidArgumentException(
                        sprintf('Unknown sort field "%s" for Logic Jump.', $field)
                    );
            }
        });

        return new ArrayCollection(iterator_to_array($iterator));
    }
}
