<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepContributionsDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\PromiseAdapter\PromiseAdapterInterface;

class StepContributionsResolver implements QueryInterface
{
    public function __construct(private readonly StepContributionsDataLoader $dataLoader, private readonly PromiseAdapterInterface $promiseAdapter)
    {
    }

    public function __invoke(AbstractStep $step, Argument $args): Promise
    {
        return $this->dataLoader->load(compact('step', 'args'));
    }

    public function resolveSync(AbstractStep $step, Argument $args): Connection
    {
        $connection = new Connection();
        $this->promiseAdapter->await(
            $this->__invoke($step, $args)->then(static function ($value) use (&$connection) {
                $connection = $value;
            })
        );

        return $connection;
    }
}
