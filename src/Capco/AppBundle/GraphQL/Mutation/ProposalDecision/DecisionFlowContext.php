<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalDecision;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Overblog\GraphQLBundle\Definition\Argument;

final class DecisionFlowContext
{
    public function __construct(
        public readonly Proposal $proposal,
        public readonly ProposalDecision $proposalDecision,
        public readonly Argument $args,
        public readonly string $oldState,
        public readonly DecisionTransitionContext $transitionContext
    ) {}
}
