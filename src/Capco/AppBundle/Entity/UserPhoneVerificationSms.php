<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(
 *     name="user_phone_verification_sms"
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository")
 */
class UserPhoneVerificationSms
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="expires_at", type="datetime")
     */
    protected \Datetime $expiresAt;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="userPhoneVerificationSms")
     */
    private User $user;

    /**
     * @ORM\Column(name="code", nullable=false, type="string", length=6)
     */
    private string $code;

    /**
     * @ORM\Column(name="status", nullable=false, type="string")
     */
    private string $status;

    public function __construct()
    {
        $expiresAt = (new \DateTime($this->createdAt))->modify('+1 day');
        $this->expiresAt = $expiresAt;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function setCode(string $code): self
    {
        $this->code = $code;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getExpiresAt(): \Datetime
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTime $expiresAt): self
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $expiresAt = (new \DateTime($createdAt->format('Y-m-d H:i:s')))->modify('+1 day');
        $this->expiresAt = $expiresAt;
        $this->createdAt = $createdAt;

        return $this;
    }

    public function isExpired(): bool
    {
        $now = new \DateTime();

        return $this->expiresAt < $now;
    }
}
