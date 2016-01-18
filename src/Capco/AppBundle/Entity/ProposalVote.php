<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * ProposalVote.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasAnonymousOrUser()
 * @CapcoAssert\EmailDoesNotBelongToUser(message="proposal.vote.email_belongs_to_user")
 * @CapcoAssert\DidNotAlreadyVote(message="proposal.vote.already_voted", repositoryPath="CapcoAppBundle:ProposalVote", objectPath="proposal")
 * @CapcoAssert\HasEnoughCreditsToVote()
 */
class ProposalVote extends AbstractVote
{
    use \Capco\AppBundle\Traits\AnonymousableTrait;
    use \Capco\AppBundle\Traits\PrivatableTrait;

    const ANONYMOUS = 'ANONYMOUS';

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $proposal;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\SelectionStep", cascade={"persist"})
     * @ORM\JoinColumn(name="selection_step_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $selectionStep;

    /**
     * @return Proposal
     */
    public function getProposal()
    {
        return $this->proposal;
    }

    /**
     * @param Proposal $proposal
     *
     * @return $this
     */
    public function setProposal(Proposal $proposal)
    {
        $this->proposal = $proposal;
        $proposal->addVote($this);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSelectionStep()
    {
        return $this->selectionStep;
    }

    /**
     * @param SelectionStep $selectionStep
     *
     * @return $this
     */
    public function setSelectionStep(SelectionStep $selectionStep)
    {
        $this->selectionStep = $selectionStep;

        return $this;
    }

    public function getRelatedEntity()
    {
        return $this->proposal;
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
