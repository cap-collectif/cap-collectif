<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait ReferenceTrait
{
    /**
     * @ORM\Column(name="reference", type="integer")
     */
    protected $reference;

    public function getReference()
    {
        return $this->reference;
    }

    /**
     * Used by the event listener, please don't use this method yourself.
     */
    public function setReference(int $reference)
    {
        $this->reference = $reference;
    }
}
