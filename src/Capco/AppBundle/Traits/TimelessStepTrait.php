<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait TimelessStepTrait
{
    /**
     * @ORM\Column(name="timeless", type="boolean", nullable=false, options={"default" = false})
     */
    private $timeless = false;

    public function isTimeless(): bool
    {
        return $this->timeless;
    }

    public function setTimeless(?bool $timeless = null): self
    {
        $this->timeless = $timeless;

        return $this;
    }
}
