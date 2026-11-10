<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalDecision;

interface DecisionFlowStrategyInterface
{
    public function execute(DecisionFlowContext $context): ?string;
}
