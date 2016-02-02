<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait DiffableTrait
{
    /**
     * @ORM\Column(name="diff", type="text", nullable=false)
     */
    private $diff;

    public function getDiff()
    {
        return $this->diff;
    }

    public function setDiff($diff)
    {
        $this->diff = $diff;

        return $this;
    }
}
