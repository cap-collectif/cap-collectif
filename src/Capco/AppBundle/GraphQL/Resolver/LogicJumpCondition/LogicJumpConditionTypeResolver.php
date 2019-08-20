<?php

namespace Capco\AppBundle\GraphQL\Resolver\LogicJumpCondition;

use Capco\AppBundle\Entity\AbstractLogicJumpCondition;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;

class LogicJumpConditionTypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractLogicJumpCondition $node)
    {
        if ($node instanceof MultipleChoiceQuestionLogicJumpCondition) {
            return $this->typeResolver->resolve('MultipleChoiceQuestionLogicJumpCondition');
        }

        throw GraphQLException::fromString('Could not resolve type of LogicJumpCondition');
    }
}
