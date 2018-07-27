<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait ValidableTrait
{
    /**
     * @ORM\Column(name="validated", type="boolean", nullable=false)
     */
    private $validated = false;

    /**
     * @return mixed
     */
    public function isValidated()
    {
        return $this->validated;
    }

    /**
     * @param mixed $validated
     *
     * @return this
     */
    public function setValidated($validated)
    {
        $this->validated = $validated;

        return $this;
    }
}
