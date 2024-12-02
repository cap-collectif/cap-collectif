<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait PinnableTrait
{
    /**
     * @ORM\Column(name="pinned", type="boolean")
     */
    protected $pinned = false;

    /**
     * @return mixed
     */
    public function isPinned()
    {
        return $this->pinned;
    }

    /**
     * @return $this
     */
    public function setPinned(mixed $pinned)
    {
        $this->pinned = $pinned;

        return $this;
    }
}
