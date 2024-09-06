<?php

namespace Capco\AppBundle\Entity\Styles;

use Capco\AppBundle\Traits\ColorableTrait;
use Capco\AppBundle\Traits\EnableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="style")
 * @ORM\Entity
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "style_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "border"      = "BorderStyle",
 *      "background"  = "BackgroundStyle",
 * })
 */
abstract class AbstractStyle
{
    use ColorableTrait;
    use EnableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="opacity", type="float", nullable=true)
     */
    private ?float $opacity = null;

    public function getOpacity(): ?float
    {
        return $this->opacity;
    }

    public function setOpacity(?float $opacity): self
    {
        $this->opacity = $opacity;

        return $this;
    }
}
