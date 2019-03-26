<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait UuidTrait
{
    /**
     * @ORM\Column(name="id", type="guid")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $id;

    public function getId()
    {
        return $this->id;
    }

    // Should be used for fixtures only
    public function setId(string $id): self
    {
        $this->id = $id;

        return $this;
    }
}
