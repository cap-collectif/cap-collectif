<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\AbstractVote;
use Doctrine\Common\Collections\Collection;

trait VotableOkNokMitigeTrait
{
    protected $votes; // Dynamic relation

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
        $this->votes->removeElement($vote);

        return $this;
    }

    public function resetVotes()
    {
        foreach ($this->votes as $vote) {
            $this->removeVote($vote);
        }

        return $this;
    }
}
