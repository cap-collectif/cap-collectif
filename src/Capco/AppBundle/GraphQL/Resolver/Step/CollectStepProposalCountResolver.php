<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;

class CollectStepProposalCountResolver implements ResolverInterface
{
    private $dataloader;
    private $adapter;

    public function __construct(
        PromiseAdapterInterface $adapter,
        ProposalFormProposalsDataLoader $dataloader
    ) {
        $this->dataloader = $dataloader;
        $this->adapter = $adapter;
    }

    // This is a helper not a pure GraphQL resolver
    public function __invoke(CollectStep $step): int
    {
        $count = 0;
        $args = new Argument([
            'first' => 0,
            'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'ASC'],
        ]);

        if ($step->getProposalForm()) {
            $promise = $this->dataloader
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
