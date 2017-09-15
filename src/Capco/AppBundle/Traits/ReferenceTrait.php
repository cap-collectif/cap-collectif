<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait ReferenceTrait
{
    /**
     * @ORM\Column(name="reference", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Capco\AppBundle\Doctrine\ReferenceGenerator")
     */
    protected $reference;

    public function getReference()
    {
        return $this->reference;
    }
}
