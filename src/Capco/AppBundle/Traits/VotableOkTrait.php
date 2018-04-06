<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

trait VotableOkTrait
{
    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    protected $votesCount = 0;
    private $votes; // Dynamic Relation

    public function resetVotes()
    {
        foreach ($this->votes as $vote) {
            $this->removeVote($vote);
        }
        $this->votesCount = 0;

        return $this;
    }

    public function userHasVote(User $user = null)
    {
        if ($user !== null) {
            foreach ($this->votes as $vote) {
                if ($vote->getUser() === $user) {
                    return true;
                }
            }
        }

        return false;
    }

    public function getVotes()
    {
        return $this->votes;
    }

    public function setVotes(Collection $votes)
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
        if ($this->votes->contains($vote)) {
            $this->votes->removeElement($vote);
        }

        return $this;
    }

    public function incrementVotesCount()
    {
        ++$this->votesCount;

        return $this;
    }

    public function decrementVotesCount()
    {
        if ($this->votesCount > 0) {
            --$this->votesCount;
        }

        return $this;
    }

    public function getVotesCount()
    {
        return $this->votesCount;
    }

    public function setVotesCount($votesCount)
    {
        $this->votesCount = $votesCount;

        return $this;
    }
}
