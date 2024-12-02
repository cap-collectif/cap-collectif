<?php

namespace Capco\AppBundle\GraphQL\Resolver\LogicJumpCondition;

use Capco\AppBundle\Entity\AbstractLogicJumpCondition;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class LogicJumpConditionTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke(AbstractLogicJumpCondition $node)
    {
        if ($node instanceof MultipleChoiceQuestionLogicJumpCondition) {
            return $this->typeResolver->resolve('MultipleChoiceQuestionLogicJumpCondition');
        }

        throw GraphQLException::fromString('Could not resolve type of LogicJumpCondition');
    }
}
