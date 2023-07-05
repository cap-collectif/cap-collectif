<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait SoftDeleteTrait
{
    /**
     * @ORM\Column(name="deleted_at", type="datetime", nullable=true)
     */
    private $deletedAt;

    /**
     * @return null|\DateTime
     */
    public function getDeletedAt()
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTime $deletedAt = null): self
    {
        $this->deletedAt = $deletedAt;

        return $this;
    }

    public function isDeleted(): bool
    {
        return null !== $this->deletedAt;
    }
}
