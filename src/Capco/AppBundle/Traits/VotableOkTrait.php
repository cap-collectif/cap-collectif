<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\OpinionVote;
use Doctrine\ORM\Mapping as ORM;

trait VotableOkTrait
{

    /**
     * @var int
     *
     * @ORM\Column(name="vote_count_ok", type="integer")
     */
    protected $voteCountOk = 0;

    public function incrementVoteOkCount()
    {
        ++$this->voteCountOk;
    }

    public function decrementVoteOkCount()
    {
        --$this->voteCountOk;
    }

    public function getVoteCountOk()
    {
        return $this->voteCountOk;
    }

    public function setVoteCountOk($voteCountOk)
    {
        $this->voteCountOk = $voteCountOk;
    }
}
