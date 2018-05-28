<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait PrivatableTrait
{
    /**
     * @ORM\Column(name="private", type="boolean", nullable=false)
     */
    private $private = false;

    public function isPrivate(): bool
    {
        return $this->private ?? false;
    }

    public function setPrivate(bool $private)
    {
        $this->private = $private;

        return $this;
    }
}
