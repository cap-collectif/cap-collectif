<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Timestampable;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

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

    // TODO: Rename to decisionMaker.

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(nullable=true, name="updated_by", referencedColumnName="id")
     */
    private $updatedBy;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="decision")
     * @ORM\JoinColumn(nullable=false)
     */
    private $proposal;

    /**
     * @ORM\Column(type="string", nullable=false)
     * @Assert\Choice(choices = {"IN_PROGRESS", "DONE"})
     */
    private $state = ProposalStatementState::IN_PROGRESS;

    /**
     * @ORM\Column(type="boolean", nullable=false, name="is_approved")
     */
    private $isApproved = true;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Status")
     * @ORM\JoinColumn(nullable=true, name="refused_reason", referencedColumnName="id")
     */
    private $refusedReason;

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

    public function getState(): string
    {
        return $this->state;
    }

    public function setState(string $state): self
    {
        $this->state = $state;

        return $this;
    }
}
