<?php

namespace Capco\AppBundle\Traits\Media;

use Capco\AppBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;

trait CoverTrait
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="cover_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    protected ?Media $cover;

    public function getCover(): ?Media
    {
        return $this->cover;
    }

    public function setCover(?Media $cover): self
    {
        $this->cover = $cover;

        return $this;
    }
}
