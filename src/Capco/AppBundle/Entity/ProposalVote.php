<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ProposalVote.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class ProposalVote extends AbstractVote
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $proposal;

    /**
     * @return Proposal
     */
    public function getProposal()
    {
        return $this->proposal;
    }

    /**
     * @param $proposal
     *
     * @return $this
     */
    public function setProposal($proposal)
    {
        $this->proposal = $proposal;
        $proposal->addVote($this);

        return $this;
    }

    public function getRelatedEntity()
    {
        return $this->Proposal;
    }

    // *************************** Lifecycle **********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->proposal != null) {
            $this->proposal->removeVote($this);
        }
    }
}
