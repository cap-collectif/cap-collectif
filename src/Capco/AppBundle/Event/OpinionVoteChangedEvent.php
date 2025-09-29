<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\OpinionVote;

class OpinionVoteChangedEvent extends AbstractVoteChangedEvent
{
    public function __construct(
        OpinionVote $vote,
        $action,
        private $previous = null
    ) {
        parent::__construct($vote, $action);
    }

    public function getPrevious()
    {
        return $this->previous;
    }
}
