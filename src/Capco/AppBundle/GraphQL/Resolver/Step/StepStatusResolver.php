<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\Helper\StepHelper;
use Capco\AppBundle\Entity\Steps\AbstractStep;

class StepStatusResolver implements ResolverInterface
{
    private $stepHelper;

    public function __construct(StepHelper $stepHelper)
    {
        $this->stepHelper = $stepHelper;
    }

    public function __invoke(AbstractStep $step)
    {
        return AbstractStep::$stepStatus[$this->stepHelper->getStatus($step)];
    }
}
