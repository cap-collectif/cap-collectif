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
     * @param mixed $pinned
     *
     * @return $this
     */
    public function setPinned($pinned)
    {
        $this->pinned = $pinned;

        return $this;
    }
}
