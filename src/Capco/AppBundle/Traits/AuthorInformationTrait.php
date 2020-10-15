<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait AuthorInformationTrait
{
    /**
     * @ORM\Column(name="ip_address", type="string", nullable=true)
     */
    protected ?string $ipAddress;

    /**
     * @ORM\Column(name="navigator", type="text", nullable=true)
     */
    protected ?string $navigator;

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress): self
    {
        $this->ipAddress = $ipAddress;

        return $this;
    }

    public function getNavigator(): ?string
    {
        return $this->navigator;
    }

    public function setNavigator(?string $navigator): self
    {
        $this->navigator = $navigator;

        return $this;
    }
}
