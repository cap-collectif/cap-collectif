<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalCurrentVotableStepResolver implements ResolverInterface
{
    private $voteResolver;

    public function __construct(ProposalStepVotesResolver $voteResolver)
    {
        $this->voteResolver = $voteResolver;
    }

    public function __invoke(Proposal $proposal): ?AbstractStep
    {
        return $this->voteResolver->getFirstVotableStepForProposal($proposal);
    }
}
