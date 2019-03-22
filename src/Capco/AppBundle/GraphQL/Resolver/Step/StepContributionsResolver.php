<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepContributionsDataLoader;

class StepContributionsResolver implements ResolverInterface
{
    private $dataLoader;
    private $promiseAdapter;

    public function __construct(
        StepContributionsDataLoader $dataLoader,
        PromiseAdapterInterface $promiseAdapter
    ) {
        $this->dataLoader = $dataLoader;
        $this->promiseAdapter = $promiseAdapter;
    }

    public function __invoke(AbstractStep $step, Argument $args): Promise
    {
        return $this->dataLoader->load(compact('step', 'args'));
    }

    public function resolveSync(AbstractStep $step, Argument $args): Connection
    {
        $conn = null;
        $this->promiseAdapter->await(
            $this->__invoke($step, $args)->then(function ($value) use (&$conn) {
                $conn = $value;
            })
        );

        return $conn;
    }
}
