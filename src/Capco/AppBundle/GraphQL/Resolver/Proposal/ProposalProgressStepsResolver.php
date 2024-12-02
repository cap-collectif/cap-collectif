<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalProgressStepDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalProgressStepsResolver implements QueryInterface
{
    public function __construct(private readonly ProposalProgressStepDataLoader $proposalProgressStepDataLoader)
    {
    }

    public function __invoke(Proposal $proposal): Promise
    {
        return $this->proposalProgressStepDataLoader->load($proposal);
    }
}
