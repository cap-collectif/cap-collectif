<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\EventDispatcher\Event;

class ProposalEvent extends Event
{
    protected $proposal;

    public function __construct(Proposal $proposal, protected $action)
    {
        $this->proposal = $proposal;
    }

    public function getProposal()
    {
        return $this->proposal;
    }

    public function getAction()
    {
        return $this->action;
    }
}
