<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\ProposalAssessmentState;
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
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="proposalAssessments")
     * @ORM\JoinColumn(name="updated_by", nullable=true)
     */
    private $updatedBy;

    /**
     * @ORM\Column(type="string", nullable=false)
     * @Assert\Choice(choices = {"EMPTY", "IN_PROGRESS", "FAVOURAVBLE", "UNFAVOURABLE", "TOO_LATE"})
     */
    private $state = ProposalAssessmentState::EMPTY;

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
     * @ORM\Column(type="integer", nullable=true)
     */
    private $estimation;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $officialResponse;

    public function __construct(Proposal $proposal)
    {
        $this->proposal = $proposal;
    }

    public function getProposal(): ?Proposal
    {
        return $this->proposal;
    }

    public function setProposal(?Proposal $proposal): self
    {
        $this->proposal = $proposal;

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

    public function getEstimation(): ?int
    {
        return $this->estimation;
    }

    public function setEstimation(?int $estimation = null): self
    {
        $this->estimation = $estimation;

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
