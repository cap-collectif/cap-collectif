<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Symfony\Component\EventDispatcher\Event;

class DecisionEvent extends Event
{
    private ProposalDecision $decision;
    private Proposal $proposal;
    private AnalysisConfiguration $analysisConfig;

    public function __construct(
        Proposal $proposal,
        ProposalDecision $decision,
        AnalysisConfiguration $analysisConfig
    ) {
        $this->decision = $decision;
        $this->proposal = $proposal;
        $this->analysisConfig = $analysisConfig;
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
