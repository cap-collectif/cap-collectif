<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\OpinionVote;
use Doctrine\ORM\Mapping as ORM;

trait VotableTrait
{
    /**
     * @var int
     *
     * @ORM\Column(name="vote_count_nok", type="integer")
     */
    protected $voteCountNok = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="vote_count_ok", type="integer")
     */
    protected $voteCountOk = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="vote_count_mitige", type="integer")
     */
    protected $voteCountMitige = 0;

    public function getVoteCountAll()
    {
        return $this->voteCountNok + $this->voteCountOk + $this->voteCountMitige;
    }

    public function incrementVoteCountByType($value)
    {
        if ($value === OpinionVote::VOTE_OK) {
            $this->voteCountOk++;
        }
        if ($value === OpinionVote::VOTE_NOK) {
            $this->voteCountNok++;
        }
        if ($value === OpinionVote::VOTE_MITIGE) {
            $this->voteCountMitige++;
        }
    }

    public function decrementVoteCountByType($value)
    {
        if ($value === OpinionVote::VOTE_OK) {
            $this->voteCountOk--;
        }
        if ($value === OpinionVote::VOTE_NOK) {
            $this->voteCountNok--;
        }
        if ($value === OpinionVote::VOTE_MITIGE) {
            $this->voteCountMitige--;
        }
    }

    public function getVoteCountNok()
    {
        return $this->voteCountNok;
    }

    public function setVoteCountNok($voteCountNok)
    {
        $this->voteCountNok = $voteCountNok;
    }

    public function getVoteCountOk()
    {
        return $this->voteCountOk;
    }

    public function setVoteCountOk($voteCountOk)
    {
        $this->voteCountOk = $voteCountOk;
    }

    public function getVoteCountMitige()
    {
        return $this->voteCountMitige;
    }

    public function setVoteCountMitige($voteCountMitige)
    {
        $this->voteCountMitige = $voteCountMitige;
    }
}
