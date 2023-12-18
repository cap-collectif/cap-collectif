<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Traits\AnonymousableTrait;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\PrivatableTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Doctrine\ORM\EntityNotFoundException;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalSelectionVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasAnonymousOrUser()
 * @CapcoAssert\EmailDoesNotBelongToUser(message="proposal.vote.email_belongs_to_user")
 * @CapcoAssert\HasEnoughCreditsToVote()
 */
class ProposalSelectionVote extends AbstractProposalVote
{
    // Deleted because for users we have a unique constraint in db
    // * @CapcoAssert\DidNotAlreadyVote(message="proposal.vote.already_voted", repositoryPath="CapcoAppBundle:ProposalSelectionVote", objectPath="proposal")

    use AnonymousableTrait;
    use PositionableTrait;
    use PrivatableTrait;

    public const ANONYMOUS = 'ANONYMOUS';

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="selectionVotes", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private Proposal $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\SelectionStep", cascade={"persist"})
     * @ORM\JoinColumn(name="selection_step_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private SelectionStep $selectionStep;

    /**
     * @ORM\ManyToOne(targetEntity=Participant::class, inversedBy="votes")
     * @ORM\JoinColumn(nullable=true, onDelete="CASCADE")
     */
    private ?Participant $participant = null;

    public function getProposal(): ?Proposal
    {
        try {
            if (!$this->proposal->isDeleted()) {
                return $this->proposal;
            }
        } catch (EntityNotFoundException $e) {
        }

        return null;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;
        $proposal->addSelectionVote($this);

        return $this;
    }

    public function getStep(): ?AbstractStep
    {
        return $this->selectionStep;
    }

    public function getSelectionStep(): ?SelectionStep
    {
        return $this->selectionStep;
    }

    public function setSelectionStep(SelectionStep $selectionStep): self
    {
        $this->selectionStep = $selectionStep;

        return $this;
    }

    public function getRelated(): ?Proposal
    {
        return $this->getProposal();
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->getProposal()) {
            $this->getProposal()->removeSelectionVote($this);
        }
    }

    public function getKind(): string
    {
        return 'proposalSelectionVote';
    }

    public function getProject(): ?Project
    {
        return $this->getProposal() ? $this->getProposal()->getProject() : null;
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), [
            'ElasticsearchVoteNestedProposal',
        ]);
    }

    public function getVoteTypeName(): string
    {
        return 'proposalSelectionVote';
    }

    public function getParticipant(): ?Participant
    {
        return $this->participant;
    }

    public function setParticipant(?Participant $participant): self
    {
        $this->participant = $participant;

        return $this;
    }
}
