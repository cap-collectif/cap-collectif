<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;

// This is a helper not a pure GraphQL resolver
class CollectStepProposalCountResolver implements ResolverInterface
{
    private $dataLoader;
    private $adapter;

    public function __construct(
        PromiseAdapterInterface $adapter,
        ProposalFormProposalsDataLoader $dataLoader
    ) {
        $this->dataLoader = $dataLoader;
        $this->adapter = $adapter;
    }

    public function __invoke(CollectStep $step): int
    {
        $count = 0;
        $args = new Argument([
            'first' => 0,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'ASC'],
        ]);

        if ($step->getProposalForm()) {
            $promise = $this->dataLoader
                ->load([
                    'form' => $step->getProposalForm(),
                    'args' => $args,
                    'viewer' => null,
                    'request' => null,
                ])
                ->then(function ($connection) use (&$count) {
                    $count = $connection->totalCount;
                });
            $this->adapter->await($promise);
        }

        return $count;
    }
}
