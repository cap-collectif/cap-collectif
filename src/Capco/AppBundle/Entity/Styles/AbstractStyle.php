<?php

namespace Capco\AppBundle\Entity\Styles;

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
    use UuidTrait;

    /**
     * @ORM\Column(name="is_enable", type="boolean")
     */
    private $isEnable = false;

    /**
     * @ORM\Column(name="color", type="string", length=7)
     */
    private $color;

    /**
     * @ORM\Column(name="opacity", type="float")
     */
    private $opacity;

    public function getIsEnable(): bool
    {
        return $this->isEnable;
    }

    public function setIsEnable(bool $isEnable): self
    {
        $this->isEnable = $isEnable;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(string $color): self
    {
        $this->color = $color;

        return $this;
    }

    public function getOpacity(): ?float
    {
        return $this->opacity;
    }

    public function setOpacity(float $opacity): self
    {
        $this->opacity = $opacity;

        return $this;
    }
}
