<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepPointsVotesCountDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

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
