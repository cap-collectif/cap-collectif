<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;

trait VotableOkTrait
{
    private Collection $votes; // Dynamic Relation

    public function resetVotes()
    {
        foreach ($this->votes as $vote) {
            $this->removeVote($vote);
        }

        return $this;
    }

    public function userHasVote(?User $user = null): bool
    {
        return null !== $this->userGetVote($user);
    }

    public function userGetVote(?User $user = null): ?AbstractVote
    {
        if (null !== $user) {
            foreach ($this->votes as $vote) {
                if ($vote->getUser() === $user) {
                    return $vote;
                }
            }
        }

        return null;
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

    /**
     * @deprecated use a resolver instead
     */
    public function getVotesCount(): int
    {
        return $this->votes->count();
    }
}
