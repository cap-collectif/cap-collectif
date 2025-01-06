<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(
 *     name="anonymous_user_proposal_sms_vote"
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository")
 */
class AnonymousUserProposalSmsVote
{
    use TimestampableTrait;
    use UuidTrait;
    final public const APPROVED = 'APPROVED';
    final public const PENDING = 'PENDING';

    /**
     * @ORM\Column(name="phone", nullable=false, type="string")
     */
    private string $phone;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal")
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private Proposal $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\SelectionStep")
     * @ORM\JoinColumn(name="selection_step_id", referencedColumnName="id", nullable=true)
     */
    private ?SelectionStep $selectionStep = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep")
     * @ORM\JoinColumn(name="collect_step_id", referencedColumnName="id", nullable=true)
     */
    private ?CollectStep $collectStep = null;

    /**
     * @ORM\Column(name="status", nullable=false, type="string")
     */
    private string $status;

    public function getId(): string
    {
        return $this->id;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    public function getProposal(): Proposal
    {
        return $this->proposal;
    }

    public function setProposal(?Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }

    public function getSelectionStep(): ?SelectionStep
    {
        return $this->selectionStep;
    }

    public function setSelectionStep(?SelectionStep $selectionStep): self
    {
        $this->selectionStep = $selectionStep;

        return $this;
    }

    public function getCollectStep(): ?CollectStep
    {
        return $this->collectStep;
    }

    public function setCollectStep(?CollectStep $collectStep): self
    {
        $this->collectStep = $collectStep;

        return $this;
    }

    public function setApproved(): self
    {
        $this->status = self::APPROVED;

        return $this;
    }

    public function setPending(): self
    {
        $this->status = self::PENDING;

        return $this;
    }
}
