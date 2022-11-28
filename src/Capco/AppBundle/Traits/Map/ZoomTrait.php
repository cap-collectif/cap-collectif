<?php

namespace Capco\AppBundle\Traits\Map;

use Doctrine\ORM\Mapping as ORM;

trait ZoomTrait
{
    /**
     * @ORM\Column(name="zoom_map", nullable=true, type="integer")
     */
    protected ?int $zoomMap;

    public function getZoomMap(): ?int
    {
        return $this->zoomMap;
    }

    public function setZoomMap(?int $zoomMap = null): self
    {
        $this->zoomMap = $zoomMap;

        return $this;
    }
}
