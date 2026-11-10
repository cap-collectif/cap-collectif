<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalDecision;

final class DecisionTransitionContext
{
    public function __construct(
        public readonly bool $wasDone,
        public readonly bool $isDoneRequested,
        public readonly bool $isTransitionToDone,
        public readonly bool $hasOfficialResponseContentChanged,
        public readonly bool $shouldDispatchFinalizationEvent
    ) {}
}
