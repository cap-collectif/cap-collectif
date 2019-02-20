<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait AnonymousableTrait
{
    /**
     * @ORM\Column(name="ip_address", type="string", nullable=true)
     * @Assert\Ip(version="all")
     */
    protected $ipAddress;

    /**
     * @ORM\Column(name="username", type="string", length=255, nullable=true)
     */
    private $username;

    /**
     * @ORM\Column(name="email", type="string", length=255, nullable=true)
     * @Assert\Email()
     */
    private $email;

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(?string $username = null): self
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email = null): self
    {
        $this->email = $email;

        return $this;
    }

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress = null): self
    {
        $this->ipAddress = $ipAddress;

        return $this;
    }
}
