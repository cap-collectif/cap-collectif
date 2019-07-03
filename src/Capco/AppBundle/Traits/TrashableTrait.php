<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Interfaces\Trashable;
use Doctrine\ORM\Mapping as ORM;

trait TrashableTrait
{
    /**
     * @ORM\Column(name="trashed_status", type="string", nullable=true, columnDefinition="ENUM('visible', 'invisible')")
     */
    private $trashedStatus;

    /**
     * @ORM\Column(name="trashed_at", type="datetime", nullable=true)
     */
    private $trashedAt;

    /**
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    private $trashedReason;

    public function isTrashed(): bool
    {
        return null !== $this->trashedStatus;
    }

    public function getTrashedStatus(): ?string
    {
        return $this->trashedStatus;
    }

    public function setTrashedStatus(?string $status)
    {
        if (!$status) {
            $this->trashedStatus = null;
            $this->trashedReason = null;
            $this->trashedAt = null;

            return $this;
        }

        if (!\in_array($status, [Trashable::STATUS_VISIBLE, Trashable::STATUS_INVISIBLE], true)) {
            throw new \InvalidArgumentException('Invalid status');
        }

        $this->trashedStatus = $status;

        // Do not overwrite a previous date
        if (!$this->trashedAt) {
            $this->trashedAt = new \DateTime();
        }

        return $this;
    }

    public function getTrashedAt(): ?\DateTime
    {
        return $this->trashedAt;
    }

    /** for the new fixture bunfle we need this setter */
    public function setTrashedAt(?\DateTime $trashedAt = null): self
    {
        $this->trashedAt = $trashedAt;

        return $this;
    }

    public function getTrashedReason(): ?string
    {
        return $this->trashedReason;
    }

    public function setTrashedReason(string $trashedReason = null)
    {
        $this->trashedReason = $trashedReason;

        return $this;
    }

    public function isTrashedInLastInterval(\DateTime $to, \DateInterval $interval): bool
    {
        if ($this->isTrashed()) {
            $diff = $this->trashedAt->diff($to);

            /*
             * (array) to fix bug on DateInterval comparison.
             * @see http://www.fabienmoreau.com/php/comparer-objets-dateinterval-en-php-5
             */
            return (array) $diff < (array) $interval;
        }

        return false;
    }
}
