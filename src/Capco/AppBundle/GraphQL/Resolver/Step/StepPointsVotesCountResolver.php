<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepPointsVotesCountDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class StepPointsVotesCountResolver implements QueryInterface
{
    public function __construct(
        private readonly StepPointsVotesCountDataLoader $pointsVotesCountDataLoader
    ) {
    }

    public function __invoke(AbstractStep $step, bool $onlyAccounted = true): Promise
    {
        return $this->pointsVotesCountDataLoader->load([
            'step' => $step,
            'onlyAccounted' => $onlyAccounted,
        ]);
    }
}
