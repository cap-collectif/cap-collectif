<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\AbstractVote;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

trait VotableTrait
{
    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalVote", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $votes;


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

}
