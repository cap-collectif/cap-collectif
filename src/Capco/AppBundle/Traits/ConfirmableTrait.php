<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait ConfirmableTrait
{
    /**
     * @ORM\Column(name="confirmed", type="boolean", nullable=false)
     */
    private $confirmed;

    /**
     * @return mixed
     */
    public function isConfirmed()
    {
        return $this->confirmed;
    }

    /**
     * @return $this
     */
    public function setConfirmed(mixed $confirmed)
    {
        $this->confirmed = $confirmed;

        return $this;
    }
}
