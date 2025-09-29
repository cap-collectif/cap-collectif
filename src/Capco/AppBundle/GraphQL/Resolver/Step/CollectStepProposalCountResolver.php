<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\PromiseAdapter\PromiseAdapterInterface;

// This is a helper not a pure GraphQL resolver
class CollectStepProposalCountResolver implements QueryInterface
{
    public function __construct(
        private readonly PromiseAdapterInterface $adapter,
        private readonly ProposalFormProposalsDataLoader $dataLoader,
        private readonly ProposalRepository $proposalRepo
    ) {
    }

    public function __invoke(CollectStep $step): int
    {
        $count = 0;
        $args = new Argument([
            'first' => 0,
            'orderBy' => [['field' => 'PUBLISHED_AT', 'direction' => 'ASC']],
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
                    $count = $connection->getTotalCount();
                })
            ;
            $this->adapter->await($promise);
        }

        return $count;
    }

    private function resolveWithMySQL(CollectStep $step): int
    {
        return $this->proposalRepo->countPublishedProposalByStep($step);
    }
}
