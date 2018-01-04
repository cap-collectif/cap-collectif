<?php

namespace Capco\AppBundle\Traits;

trait VersionableTrait
{
    /**
     * @ORM\Version()
     * @ORM\Column(name="version", type="integer")
     */
    protected $version = 1;

    public function getVersion(): int
    {
        return $this->version;
    }

    public function setVersion(int $version): self
    {
        $this->version = $version;

        return $this;
    }
}
