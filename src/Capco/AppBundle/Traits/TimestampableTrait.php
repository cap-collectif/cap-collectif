<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

trait TimestampableTrait
{
    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected $createdAt;

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

    public function isUpdatedInLastInterval(\DateTimeInterface $to, \DateInterval $interval): bool
    {
        if (property_exists($this, 'updatedAt') && $this->updatedAt) {
            $diff = $this->updatedAt->diff($to);

            return $diff < $interval;
        }

        return false;
    }

    public function isDeletedInLastInterval(\DateTimeInterface $to, \DateInterval $interval): bool
    {
        if (method_exists($this, 'isDeleted')) {
            if ($this->isDeleted() && isset($this->deletedAt)) {
                $diff = $this->deletedAt->diff($to);

                return $diff < $interval;
            }
        }

        return false;
    }
}
