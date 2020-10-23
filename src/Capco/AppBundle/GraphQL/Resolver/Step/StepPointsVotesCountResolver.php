<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepPointsVotesCountDataLoader;

class StepPointsVotesCountResolver implements ResolverInterface
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
