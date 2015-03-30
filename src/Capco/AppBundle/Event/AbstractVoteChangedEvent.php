<?php

namespace Capco\AppBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use Capco\AppBundle\Entity\AbstractVote;

class AbstractVoteChangedEvent extends Event
{
    protected $vote;
    protected $action;

    public function __construct(AbstractVote $vote, $action)
    {
        $this->vote = $vote;
        $this->action = $action;
    }

    public function getVote()
    {
        return $this->vote;
    }

    public function getAction()
    {
        return $this->action;
    }
}
