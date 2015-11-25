<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\OpinionVote;

class OpinionVoteChangedEvent extends AbstractVoteChangedEvent
{
    private $previous;

    public function __construct(OpinionVote $vote, $action, $previous = null)
    {
        $this->vote = $vote;
        $this->action = $action;
        $this->previous = $previous;
    }

    public function getPrevious()
    {
        return $this->previous;
    }
}
