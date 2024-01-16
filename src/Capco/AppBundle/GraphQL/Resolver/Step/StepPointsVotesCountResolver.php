<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepPointsVotesCountDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class StepPointsVotesCountResolver implements QueryInterface
{
    private StepPointsVotesCountDataLoader $pointsVotesCountDataLoader;

    public function __construct(StepPointsVotesCountDataLoader $pointsVotesCountDataLoader)
    {
        $this->pointsVotesCountDataLoader = $pointsVotesCountDataLoader;
    }

    public function __invoke(AbstractStep $step, bool $onlyAccounted = true): Promise
    {
        return $this->pointsVotesCountDataLoader->load([
            'step' => $step,
            'onlyAccounted' => $onlyAccounted,
        ]);
    }
}
