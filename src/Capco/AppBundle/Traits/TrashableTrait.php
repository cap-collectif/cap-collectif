<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

trait TrashableTrait
{
    /**
     * @ORM\Column(name="trashed", type="boolean")
     */
    private $isTrashed = false;

    /**
     * @Gedmo\Timestampable(on="change", field={"isTrashed"})
     * @ORM\Column(name="trashed_at", type="datetime", nullable=true)
     */
    private $trashedAt = null;

    /**
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    private $trashedReason = null;

    /**
     * @return bool
     */
    public function getIsTrashed()
    {
        return $this->isTrashed;
    }

    public function isTrashed()
    {
        return $this->isTrashed;
    }

    public function setTrashed($isTrashed)
    {
        if (!$isTrashed) {
            $this->trashedReason = null;
            $this->trashedAt = null;
        }
        $this->isTrashed = $isTrashed;

        return $this;
    }

    /**
     * @param bool $isTrashed
     */
    public function setIsTrashed($isTrashed)
    {
        if (!$isTrashed) {
            $this->trashedReason = null;
            $this->trashedAt = null;
        }
        $this->isTrashed = $isTrashed;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getTrashedAt()
    {
        return $this->trashedAt;
    }

    /**
     * @param \DateTime $trashedAt
     */
    public function setTrashedAt($trashedAt)
    {
        $this->trashedAt = $trashedAt;

        return $this;
    }

    /**
     * @return string
     */
    public function getTrashedReason()
    {
        return $this->trashedReason;
    }

    public function setTrashedReason(string $trashedReason = null)
    {
        $this->trashedReason = $trashedReason;

        return $this;
    }
}
