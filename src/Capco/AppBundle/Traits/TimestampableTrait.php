<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

trait TimestampableTrait
{
    use FormatDateTrait;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected ?\DateTimeInterface $createdAt = null;

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): self
    {
        if (property_exists($this, 'updatedAt')) {
            $this->updatedAt = $updatedAt;
        }

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        if (property_exists($this, 'updatedAt')) {
            return $this->updatedAt;
        }

        return null;
    }

    public function getLastModifiedAt(): \DateTimeInterface
    {
        if (property_exists($this, 'updatedAt')) {
            return $this->updatedAt ?? $this->createdAt;
        }

        return $this->createdAt;
    }

    public function isUpdatedInLastInterval(
        \DateTimeInterface $dateSince,
        \DateInterval $interval
    ): bool {
        if (property_exists($this, 'updatedAt') && $this->updatedAt) {
            $newDate = $dateSince->add($interval);

            return $newDate < $this->updatedAt;
        }

        return false;
    }

    public function isDeletedInLastInterval(
        \DateTimeInterface $dateSince,
        \DateInterval $interval
    ): bool {
        if (method_exists($this, 'isDeleted')) {
            if ($this->isDeleted() && isset($this->deletedAt)) {
                $newDate = $dateSince->add($interval);

                return $newDate < $this->updatedAt;
            }
        }

        return false;
    }
}
