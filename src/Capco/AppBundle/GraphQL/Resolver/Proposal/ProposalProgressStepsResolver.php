<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalProgressStepDataLoader;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use GraphQL\Executor\Promise\Promise;

class ProposalProgressStepsResolver implements ResolverInterface
{
    private $proposalProgressStepDataLoader;

    public function __construct(ProposalProgressStepDataLoader $proposalProgressStepDataLoader)
    {
        $this->proposalProgressStepDataLoader = $proposalProgressStepDataLoader;
    }

    public function __invoke(Proposal $proposal): Promise
    {
        return $this->proposalProgressStepDataLoader->load($proposal);
    }
}
