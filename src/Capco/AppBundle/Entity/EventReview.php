<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
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

    /**
     * @ORM\Column(name="status", type="enum_event_review_status", nullable=true)
     */
    private $status = EventReviewStatusType::AWAITING;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="reviewer_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $reviewer;

    /**
     * @ORM\Column(name="refused_reason", type="enum_event_review_refused_reason", nullable=true)
     */
    private $refusedReason = '';

    /**
     * @ORM\Column(name="comment", type="text", nullable=true)
     */
    private $comment;

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

    public function getRefusedReason()
    {
        return $this->refusedReason;
    }

    public function setRefusedReason(?string $refusedReason = null): self
    {
        $this->refusedReason = $refusedReason;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment = null): self
    {
        $this->comment = $comment;

        return $this;
    }
}
