<?php

namespace Capco\AppBundle\Entity\Styles;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class BorderStyle extends AbstractStyle
{
    /**
     * @ORM\Column(name="size", type="integer")
     */
    private $size;

    public function getSize(): ?int
    {
        return $this->size;
    }

    public function setSize(int $size): self
    {
        $this->size = $size;

        return $this;
    }
}
