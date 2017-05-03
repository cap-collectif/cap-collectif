<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\EventDispatcher\Event;

class ProposalEvent extends Event
{
    protected $proposal;
    protected $action;

    public function __construct(Proposal $proposal, $action)
    {
        $this->proposal = $proposal;
        $this->action = $action;
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
