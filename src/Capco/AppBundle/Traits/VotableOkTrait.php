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
     * TODO replace by call to ES. Still used in comment, source and DebateArgument
     */
    protected int $votesCount = 0;
    private Collection $votes; // Dynamic Relation

    public function resetVotes()
    {
        foreach ($this->votes as $vote) {
            $this->removeVote($vote);
        }
        $this->votesCount = 0;

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
        $this->votesCount = $votes->count();

        return $this;
    }

    public function addVote(AbstractVote $vote)
    {
        if (!$this->votes->contains($vote)) {
            $this->votes->add($vote);
            ++$this->votesCount;
        }

        return $this;
    }

    public function removeVote(AbstractVote $vote)
    {
        if ($this->votes->contains($vote)) {
            $this->votes->removeElement($vote);
            --$this->votesCount;
        }

        return $this;
    }

    /**
     * @deprecated use a resolver instead
     */
    public function getVotesCount(): int
    {
        return $this->votesCount;
    }

    /**
     * @deprecated do not use it
     */
    public function setVotesCount(int $votesCount)
    {
        return $this->votesCount = $votesCount;
    }
}
