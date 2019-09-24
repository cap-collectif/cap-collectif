<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(
 * name="user_connection",
 * indexes={
 *   @ORM\Index(name="idx_email_success_datetime", columns={"email", "success", "datetime"}),
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserConnectionRepository")
 */
class UserConnection
{
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $user;

    /**
     * @ORM\Column(name="email", type="string")
     */
    private $email;
    
    /**
     * @ORM\Column(name="datetime", type="datetime")
     */
    private $datetime;
    
    /**
     * @ORM\Column(name="ip_address", type="string")
     */
    private $ipAddress;
    
    /**
     * @ORM\Column(name="success", type="boolean")
     */
    private $success;

    /**
     * @ORM\Column(name="navigator", type="string")
     */
    private $navigator;

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getDatetime(): \DateTime
    {
        return $this->datetime;
    }

    public function setDatetime(\DateTime $datetime): self
    {
        $this->datetime = $datetime;

        return $this;
    }

    public function getIpAddress(): string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(string $ipAddress): self
    {
        $this->ipAddress = $ipAddress;

        return $this;
    }

    public function isSuccess(): bool
    {
        return $this->success;
    }

    public function setSuccess(bool $success): self
    {
        $this->success = $success;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser($user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getNavigator(): string
    {
        return $this->navigator;
    }

    public function setNavigator(string $navigator): self
    {
        $this->navigator = $navigator;

        return $this;
    }

}
