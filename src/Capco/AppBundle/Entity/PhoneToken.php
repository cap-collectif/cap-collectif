<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\Id;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PhoneTokenRepository")
 * @ORM\Table(name="phone_token")
 */
class PhoneToken
{
    /**
     * @Id @ORM\Column(name="phone", type="string", nullable=false)
     */
    private string $phone;

    /**
     * @Id @ORM\Column(name="token", type="string", nullable=false)
     */
    private string $token;

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }
}
