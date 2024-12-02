<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Symfony\Component\EventDispatcher\Event;

class DecisionEvent extends Event
{
    public function __construct(private readonly Proposal $proposal, private readonly ProposalDecision $decision, private readonly AnalysisConfiguration $analysisConfig)
    {
    }

    public function getDecision(): ProposalDecision
    {
        return $this->decision;
    }

    public function getProposal(): Proposal
    {
        return $this->proposal;
    }

    public function getAnalysisConfig(): AnalysisConfiguration
    {
        return $this->analysisConfig;
    }
}
