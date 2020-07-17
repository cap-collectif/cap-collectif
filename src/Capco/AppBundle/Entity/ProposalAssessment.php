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
 * @ORM\Table(name="proposal_assessment")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalAssessmentRepository")
 */
class ProposalAssessment implements Timestampable
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="assessment")
     * @ORM\JoinColumn(nullable=false)
     */
    private $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="updated_by", nullable=true, referencedColumnName="id")
     */
    private $updatedBy;

    /**
     * @ORM\Column(type="string", nullable=false)
     * @Assert\Choice(choices = {"IN_PROGRESS", "FAVOURABLE", "UNFAVOURABLE", "TOO_LATE"})
     */
    private $state = ProposalStatementState::IN_PROGRESS;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", name="updated_at")
     */
    private $updatedAt;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $body;

    /**
     * @ORM\Column(type="integer", nullable=true, name="estimated_cost")
     */
    private $estimatedCost;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $officialResponse;

    public function __construct(Proposal $proposal)
    {
        $this->setProposal($proposal);
    }

    public function getProposal(): ?Proposal
    {
        return $this->proposal;
    }

    public function setProposal(?Proposal $proposal): self
    {
        $this->proposal = $proposal;

        // set (or unset) the owning side of the relation if necessary
        $newAssessment = null === $proposal ? null : $this;
        if ($proposal->getAssessment() !== $newAssessment) {
            $proposal->setAssessment($newAssessment);
        }

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

    public function getState(): string
    {
        return $this->state;
    }

    public function setState(string $state): self
    {
        $this->state = $state;

        return $this;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function setBody(?string $body = null): self
    {
        $this->body = $body;

        return $this;
    }

    public function getEstimatedCost(): ?int
    {
        return $this->estimatedCost;
    }

    public function setEstimatedCost(?int $estimatedCost = null): self
    {
        $this->estimatedCost = $estimatedCost;

        return $this;
    }

    public function getOfficialResponse(): ?string
    {
        return $this->officialResponse;
    }

    public function setOfficialResponse(?string $officialResponse): self
    {
        $this->officialResponse = $officialResponse;

        return $this;
    }
}
