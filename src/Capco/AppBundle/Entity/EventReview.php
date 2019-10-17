<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\ReportingStatus as ReviewRefusedStatus;
use Capco\AppBundle\Enum\ReviewStatus;
use Capco\AppBundle\Model\CreatableInterface;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User as Reviewer;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="event_review")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventReviewRepository")
 */
class EventReview implements CreatableInterface
{
    use UuidTrait;
    use TimestampableTrait;
    use ReviewRefusedStatus;

    /**
     * @ORM\Column(name="status", type="string", nullable=true, columnDefinition="ENUM('approved', 'refused', 'awaiting')", options={"default": "awaiting"})
     */
    private $status = ReviewStatus::AWAITING;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="reviewer_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $reviewer;

    /**
     * @ORM\Column(name="reason", type="integer", nullable=true, columnDefinition="ENUM('0','1','2','3','4')")
     */
    private $reason;

    /**
     * @ORM\Column(name="details", type="text", nullable=true)
     */
    private $details;

    /**
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getReviewer(): ?Reviewer
    {
        return $this->reviewer;
    }

    public function setReviewer(?Reviewer $reviewer): self
    {
        $this->reviewer = $reviewer;

        return $this;
    }

    public function getReason()
    {
        return $this->reason;
    }

    public function setReason(?int $reason = null): self
    {
        $this->reason = $reason;

        return $this;
    }

    public function getDetails(): ?string
    {
        return $this->details;
    }

    public function setDetails(?string $details = null): self
    {
        $this->details = $details;

        return $this;
    }
}
