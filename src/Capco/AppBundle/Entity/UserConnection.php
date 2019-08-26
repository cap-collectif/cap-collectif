<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_connection")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserConnectionRepository")
 */
class UserConnection
{
    use IdTrait;

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
    public function setEmail(string $email)
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
    public function setSuccess(bool $success)
    {
        $this->success = $success;

        return $this;
    }
}
