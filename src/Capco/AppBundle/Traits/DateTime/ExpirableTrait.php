<?php

namespace Capco\AppBundle\Traits\DateTime;

use Doctrine\ORM\Mapping as ORM;

trait ExpirableTrait
{
    /**
     * @ORM\Column(name="expires_at", type="datetime")
     */
    private \DateTimeInterface $expiresAt;

    public function getExpiresAt(): \DateTimeInterface
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeInterface $expiresAt): self
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function hasExpired(): bool
    {
        return $this->expiresAt < new \DateTimeImmutable();
    }
}
