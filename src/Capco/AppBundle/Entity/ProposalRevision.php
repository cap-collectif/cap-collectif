<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\DBAL\Enum\ProposalRevisionStateType;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="proposal_revision")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalRevisionRepository")
 * @CapcoAssert\HasAuthor()
 */
class ProposalRevision implements Authorable
{
    use BodyUsingJoditWysiwygTrait;
    use TextableTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="reason", type="text")
     * @Assert\NotNull()
     */
    private string $reason;

    /**
     * @ORM\Column(name="revision_state", type="enum_proposal_revision_state", nullable=false)
     */
    private string $state = ProposalRevisionStateType::PENDING;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private ?User $author = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="revisions")
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private Proposal $proposal;

    /**
     * @ORM\Column(name="expires_at", type="datetime")
     * @Assert\NotNull()
     */
    private \DateTimeInterface $expiresAt;

    /**
     * @ORM\Column(name="revised_at", type="datetime", nullable=true)
     */
    private \DateTimeInterface $revisedAt;

    public function getReason(): string
    {
        return $this->reason;
    }

    public function setReason(string $reason): self
    {
        $this->reason = $reason;

        return $this;
    }

    public function getState(): string
    {
        $now = new \DateTime('now');
        if ($this->expiresAt < $now && ProposalRevisionStateType::PENDING === $this->state) {
            return ProposalRevisionStateType::EXPIRED;
        }
        if (ProposalRevisionStateType::REVISED === $this->state) {
            return ProposalRevisionStateType::REVISED;
        }

        return ProposalRevisionStateType::PENDING;
    }

    public function setState(string $state): self
    {
        $this->state = $state;

        return $this;
    }

    public function getAuthor(): ?Author
    {
        return $this->author;
    }

    public function setAuthor(?Author $author): self
    {
        $this->author = $author;

        return $this;
    }

    public function getProposal(): Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }

    public function getExpiresAt(): ?\DateTimeInterface
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeInterface $expiresAt): self
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function getRevisedAt(): ?\DateTimeInterface
    {
        return $this->revisedAt;
    }

    public function setRevisedAt(?\DateTimeInterface $revisedAt): self
    {
        $this->revisedAt = $revisedAt;

        return $this;
    }

    public function isExpired(): bool
    {
        return $this->expiresAt < new \DateTime()
            && ProposalRevisionStateType::PENDING === $this->state;
    }
}
