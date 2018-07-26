<?php
namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

trait VotableOkNokMitigeTrait
{
    protected $votes; // Dynamic relation

    /**
     * @ORM\Column(name="vote_count_nok", type="integer")
     */
    protected $votesCountNok = 0;

    /**
     * @ORM\Column(name="vote_count_ok", type="integer")
     */
    protected $votesCountOk = 0;

    /**
     * @ORM\Column(name="vote_count_mitige", type="integer")
     */
    protected $votesCountMitige = 0;

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

    public function getVotesCountAll()
    {
        return $this->votesCountNok + $this->votesCountOk + $this->votesCountMitige;
    }

    public function resetVotes()
    {
        foreach ($this->votes as $vote) {
            $this->removeVote($vote);
        }
        $this->votesCountMitige = 0;
        $this->votesCountNok = 0;
        $this->votesCountOk = 0;

        return $this;
    }

    public function incrementVotesCountByType($value)
    {
        if (OpinionVote::VOTE_OK === $value) {
            ++$this->votesCountOk;
        }
        if (OpinionVote::VOTE_NOK === $value) {
            ++$this->votesCountNok;
        }
        if (OpinionVote::VOTE_MITIGE === $value) {
            ++$this->votesCountMitige;
        }
    }

    public function decrementVotesCountByType($value)
    {
        if (OpinionVote::VOTE_OK === $value) {
            --$this->votesCountOk;
        }
        if (OpinionVote::VOTE_NOK === $value) {
            --$this->votesCountNok;
        }
        if (OpinionVote::VOTE_MITIGE === $value) {
            --$this->votesCountMitige;
        }
    }

    public function getVotesCountNok()
    {
        return $this->votesCountNok;
    }

    public function setVotesCountNok($votesCountNok)
    {
        $this->votesCountNok = $votesCountNok;

        return $this;
    }

    public function getVotesCountOk()
    {
        return $this->votesCountOk;
    }

    public function setVotesCountOk($votesCountOk)
    {
        $this->votesCountOk = $votesCountOk;

        return $this;
    }

    public function getVotesCountMitige()
    {
        return $this->votesCountMitige;
    }

    public function setVotesCountMitige($votesCountMitige)
    {
        $this->votesCountMitige = $votesCountMitige;

        return $this;
    }
}
