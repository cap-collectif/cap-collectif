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

    final public const APPROVED = 'APPROVED';
    final public const PENDING = 'PENDING';

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="userPhoneVerificationSms")
     */
    private User $user;

    /**
     * @ORM\Column(name="status", nullable=false, type="string")
     */
    private string $status;

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

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function setApproved(): self
    {
        $this->status = self::APPROVED;

        return $this;
    }

    public function setPending(): self
    {
        $this->status = self::PENDING;

        return $this;
    }
}
