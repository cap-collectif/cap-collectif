<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait ConfirmableTrait
{
    /**
     * @ORM\Column(name="confirmed", type="boolean", nullable=false)
     */
    private $confirmed = false;

    /**
     * @return mixed
     */
    public function isConfirmed()
    {
        return $this->confirmed;
    }

    /**
     * @param mixed $confirmed
     *
     * @return $this
     */
    public function setConfirmed($confirmed)
    {
        $this->confirmed = $confirmed;

        return $this;
    }
}
