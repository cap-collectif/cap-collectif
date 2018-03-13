<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

trait TimestampableTrait
{
    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected $createdAt;

    public function setCreatedAt(\DateTime $createdAt):self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function isCreatedInLastInterval(\DateTime $to, \DateInterval $interval): bool
    {
        $diff = $this->createdAt->diff($to);

        return $diff < $interval;
    }

    public function isUpdatedInLastInterval(\DateTime $to, \DateInterval $interval): bool
    {
        $diff = $this->updatedAt->diff($to);

        return $diff < $interval;
    }

    public function isDeletedInLastInterval(\DateTime $to, \DateInterval $interval): bool
    {
        if ($this->isDeleted() && isset($this->deletedAt)) {
            $diff = $this->deletedAt->diff($to);

            return $diff < $interval;
        }

        return false;
    }
}
