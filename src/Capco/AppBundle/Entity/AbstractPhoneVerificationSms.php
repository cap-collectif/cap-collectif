<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\PhoneVerificationSmsInterface;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\MappedSuperclass
 */
abstract class AbstractPhoneVerificationSms implements PhoneVerificationSmsInterface
{
    use TimestampableTrait;
    use UuidTrait;

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

    public function setAlreadyConfirmed(): self
    {
        $this->status = self::ALREADY_CONFIRMED;

        return $this;
    }
}
