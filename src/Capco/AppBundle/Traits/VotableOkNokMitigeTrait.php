<?php

namespace Capco\AppBundle\Traits;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\OpinionVote;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

trait VotableOkNokMitigeTrait
{

    protected $votes; // Dynamic relation

    /**
     * @ORM\Column(name="vote_count_nok", type="integer")
     */
    protected $voteCountNok = 0;

    /**
     * @ORM\Column(name="vote_count_ok", type="integer")
     */
    protected $voteCountOk = 0;

    /**
     * @ORM\Column(name="vote_count_mitige", type="integer")
     */
    protected $voteCountMitige = 0;


    public function getVotes()
    {
        return $this->votes;
    }

    public function setVotes(ArrayCollection $votes)
    {
        $this->votes = $votes;

        return $this;
    }

    public function addVote(AbstractVote $vote)
    {
        if (!$this->votes->contains($vote)) {
            $this->votes->add($vote);
        }

        return $this;
    }

    public function removeVote(AbstractVote $vote)
    {
        $this->votes->removeElement($vote);

        return $this;
    }

    public function getVoteCountAll()
    {
        return $this->voteCountNok + $this->voteCountOk + $this->voteCountMitige;
    }

    public function getVoteValueByUser(User $user)
    {
        foreach ($this->votes as $vote) {
            if ($vote->getUser() === $user && $vote->isConfirmed()) {
                return $vote->getValue();
            }
        }

        return;
    }

    public function resetVotes()
    {
        foreach ($this->votes as $vote) {
            $this->removeVote($vote);
        }
        $this->voteCountMitige = 0;
        $this->voteCountNok = 0;
        $this->voteCountOk = 0;

        return $this;
    }

    public function incrementVoteCountByType($value)
    {
        if ($value === OpinionVote::VOTE_OK) {
            ++$this->voteCountOk;
        }
        if ($value === OpinionVote::VOTE_NOK) {
            ++$this->voteCountNok;
        }
        if ($value === OpinionVote::VOTE_MITIGE) {
            ++$this->voteCountMitige;
        }
    }

    public function decrementVoteCountByType($value)
    {
        if ($value === OpinionVote::VOTE_OK) {
            --$this->voteCountOk;
        }
        if ($value === OpinionVote::VOTE_NOK) {
            --$this->voteCountNok;
        }
        if ($value === OpinionVote::VOTE_MITIGE) {
            --$this->voteCountMitige;
        }
    }

    public function getVoteCountNok()
    {
        return $this->voteCountNok;
    }

    public function setVoteCountNok($voteCountNok)
    {
        $this->voteCountNok = $voteCountNok;

        return $this;
    }

    public function getVoteCountOk()
    {
        return $this->voteCountOk;
    }

    public function setVoteCountOk($voteCountOk)
    {
        $this->voteCountOk = $voteCountOk;

        return $this;
    }

    public function getVoteCountMitige()
    {
        return $this->voteCountMitige;
    }

    public function setVoteCountMitige($voteCountMitige)
    {
        $this->voteCountMitige = $voteCountMitige;

        return $this;
    }
}
