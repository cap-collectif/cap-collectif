<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\AbstractVote;
use Symfony\Component\EventDispatcher\Event;

class AbstractVoteChangedEvent extends Event
{
    protected $vote;

    public function __construct(AbstractVote $vote, protected $action)
    {
        $this->vote = $vote;
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
