<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepVotesCountDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class StepVotesCountResolver implements QueryInterface
{
    public function __construct(private readonly StepVotesCountDataLoader $votesCountDataLoader)
    {
    }

    public function __invoke(
        AbstractStep $step,
        bool $onlyAccounted = true,
        ?bool $anonymous = null
    ): Promise {
        return $this->votesCountDataLoader->load([
            'step' => $step,
            'onlyAccounted' => $onlyAccounted,
            'anonymous' => $anonymous,
        ]);
    }
}
