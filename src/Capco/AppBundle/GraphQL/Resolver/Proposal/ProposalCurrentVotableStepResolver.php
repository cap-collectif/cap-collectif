<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalCurrentVotableStepDataLoader;

class ProposalCurrentVotableStepResolver implements ResolverInterface
{
    private $dataloader;

    public function __construct(ProposalCurrentVotableStepDataLoader $dataloader)
    {
        $this->dataloader = $dataloader;
    }

    public function __invoke(Proposal $proposal): Promise
    {
        return $this->dataloader->load(compact('proposal'));
    }
}
