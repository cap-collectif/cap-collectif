<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\OpinionVote;

class OpinionVoteChangedEvent extends AbstractVoteChangedEvent
{
    private $previous;

    public function __construct(OpinionVote $vote, $action, $previous = null)
    {
        $this->previous = $previous;
        parent::__construct($vote, $action);
    }

    public function getPrevious()
    {
        return $this->previous;
    }
}
