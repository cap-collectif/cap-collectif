<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Timestampable;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalDecisionRepository")
 * @ORM\Table(name="proposal_decision")
 */
class ProposalDecision implements Timestampable
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Post", cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=false)
     */
    private $post;

    /**
     * @ORM\Column(type="integer", nullable=true, name="estimated_cost")
     */
    private $estimatedCost;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(nullable=false, name="updated_by")
     */
    private $updatedBy;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="decision")
     * @ORM\JoinColumn(nullable=false)
     */
    private $proposal;

    /**
     * @ORM\Column(type="boolean", nullable=false, name="is_approved")
     */
    private $isApproved = true;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Status")
     * @ORM\JoinColumn(nullable=true, name="refused_reason", referencedColumnName="id")
     */
    private $refusedReason;

    /**
     * @ORM\Column(type="boolean", nullable=false, name="is_done")
     */
    private $isDone = false;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private $updatedAt;

    public function __construct(Proposal $proposal, Post $post)
    {
        $this->proposal = $proposal;
        $this->post = $post;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getPost(): Post
    {
        return $this->post;
    }

    public function setPost(Post $post): self
    {
        $this->post = $post;

        return $this;
    }

    public function getEstimatedCost(): ?int
    {
        return $this->estimatedCost;
    }

    public function setEstimatedCost(?int $estimatedCost): self
    {
        $this->estimatedCost = $estimatedCost;

        return $this;
    }

    public function isApproved(): ?bool
    {
        return $this->isApproved;
    }

    public function setIsApproved(?bool $isApproved = null): self
    {
        $this->isApproved = $isApproved;

        return $this;
    }

    public function getRefusedReason(): ?Status
    {
        return $this->refusedReason;
    }

    public function setRefusedReason(?Status $refusedReason = null): self
    {
        $this->refusedReason = $refusedReason;

        return $this;
    }

    public function getUpdatedBy(): ?User
    {
        return $this->updatedBy;
    }

    public function setUpdatedBy(?User $updatedBy): self
    {
        $this->updatedBy = $updatedBy;

        return $this;
    }

    public function getProposal(): ?Proposal
    {
        return $this->proposal;
    }

    public function setProposal(?Proposal $proposal): self
    {
        $this->proposal = $proposal;

        // set (or unset) the owning side of the relation if necessary
        $newDecision = null === $proposal ? null : $this;
        if ($proposal->getDecision() !== $newDecision) {
            $proposal->setDecision($newDecision);
        }

        return $this;
    }

    public function getIsDone(): bool
    {
        return $this->isDone;
    }

    public function setIsDone(bool $isDone): self
    {
        $this->isDone = $isDone;

        return $this;
    }
}
