<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait ExpirableTrait
{
    /**
     * @ORM\Column(name="expired", type="boolean", nullable=false)
     */
    private $expired = false;

    /**
     * @return mixed
     */
    public function isExpired()
    {
        return $this->expired;
    }

    /**
     * @param mixed $expired
     *
     * @return $this
     */
    public function setExpired($expired)
    {
        $this->expired = $expired;

        return $this;
    }
}
