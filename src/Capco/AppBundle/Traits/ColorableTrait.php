<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait ColorableTrait
{
    /**
     * @var string
     *
     * @ORM\Column(name="color", type="string", length=255)
     * @Assert\NotBlank()
     */
    protected $color;

    /**
     * @return string
     */
    public function getColor()
    {
        return $this->color;
    }

    /**
     * @param string $color
     *
     * @return $this
     */
    public function setColor($color)
    {
        $this->color = $color;

        return $this;
    }
}
