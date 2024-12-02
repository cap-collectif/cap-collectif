<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalCurrentVotableStepDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalCurrentVotableStepResolver implements QueryInterface
{
    public function __construct(private readonly ProposalCurrentVotableStepDataLoader $dataLoader)
    {
    }

    public function __invoke(Proposal $proposal): Promise
    {
        return $this->dataLoader->load(compact('proposal'));
    }
}
