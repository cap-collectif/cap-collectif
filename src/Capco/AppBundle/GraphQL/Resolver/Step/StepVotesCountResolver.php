<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepVotesCountDataLoader;

class StepVotesCountResolver implements ResolverInterface
{
    private $votesCountDataLoader;

    public function __construct(StepVotesCountDataLoader $votesCountDataLoader)
    {
        $this->votesCountDataLoader = $votesCountDataLoader;
    }

    public function __invoke(AbstractStep $step): Promise
    {
        return $this->votesCountDataLoader->load([
            'step' => $step,
        ]);
    }
}
