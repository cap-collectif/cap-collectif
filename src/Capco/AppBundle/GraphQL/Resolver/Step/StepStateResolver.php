<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Helper\StepHelper;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class StepStateResolver implements QueryInterface
{
    public function __construct(private readonly StepHelper $stepHelper)
    {
    }

    public function __invoke(AbstractStep $step): string
    {
        return AbstractStep::$stepStates[$this->stepHelper->getStatus($step)];
    }
}
