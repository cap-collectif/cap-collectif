<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait ReferenceTrait
{
    /**
     * @ORM\Column(name="reference", type="integer")
     */
    protected $reference;

    /**
     * Don't put type hint "int" to this function (used by the event listener) waiting for php7.1.
     */
    public function getReference()
    {
        return $this->reference;
    }

    /**
     * Used by the event listener, please don't use this method yourself.
     */
    public function setReference(int $reference): self
    {
        $this->reference = $reference;

        return $this;
    }
}
