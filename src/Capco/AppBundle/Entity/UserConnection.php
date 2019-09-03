<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_connection")
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
     * @var string
     * @ORM\Column(name="email", type="string")
     */
    private $email;
    /**
     * @var \DateTime
     * @ORM\Column(name="datetime", type="datetime")
     */
    private $datetime;
    /**
     * @var string
     * @ORM\Column(name="ip_address", type="string")
     */
    private $ipAddress;
    /**
     * @var bool
     * @ORM\Column(name="success", type="boolean")
     */
    private $success;
    /**
     * @var string
     * @ORM\Column(name="navigator", type="string")
     */
    private $navigator;

    /**
     * @return string
     */
    public function getEmail(): string
    {
        return $this->email;
    }

    /**
     * @param string $email
     *
     * @return UserConnection
     */
    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getDatetime(): \DateTime
    {
        return $this->datetime;
    }

    /**
     * @param \DateTime $datetime
     *
     * @return UserConnection
     */
    public function setDatetime(\DateTime $datetime)
    {
        $this->datetime = $datetime;

        return $this;
    }

    /**
     * @return string
     */
    public function getIpAddress(): string
    {
        return $this->ipAddress;
    }

    /**
     * @param string $ipAddress
     *
     * @return UserConnection
     */
    public function setIpAddress(string $ipAddress)
    {
        $this->ipAddress = $ipAddress;

        return $this;
    }

    /**
     * @return bool
     */
    public function isSuccess(): bool
    {
        return $this->success;
    }

    /**
     * @param bool $success
     *
     * @return UserConnection
     */
    public function setSuccess(bool $success): self
    {
        $this->success = $success;

        return $this;
    }

    /**
     * @return User | null
     */
    public function getUser(): ?User
    {
        return $this->user;
    }

    /**
     * @param User | null $user
     *
     * @return UserConnection
     */
    public function setUser($user): self
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return string
     */
    public function getNavigator(): string
    {
        return $this->navigator;
    }

    /**
     * @param string $navigator
     *
     * @return UserConnection
     */
    public function setNavigator(string $navigator): self
    {
        $this->navigator = $navigator;

        return $this;
    }
}
