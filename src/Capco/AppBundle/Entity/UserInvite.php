<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=UserInviteRepository::class)
 * @ORM\EntityListeners({"Capco\AppBundle\EventListener\UserInviteListener"})
 * @ORM\Table(name="user_invite")
 */
class UserInvite
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255, unique=true)
     */
    private string $email;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $token;

    /**
     * @ORM\Column(name="expires_at", type="datetime")
     */
    private \DateTimeInterface $expiresAt;

    /**
     * @ORM\Column(name="is_admin", type="boolean")
     */
    private bool $isAdmin;

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function getExpiresAt(): ?\DateTimeInterface
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeInterface $expiresAt): self
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function isAdmin(): ?bool
    {
        return $this->isAdmin;
    }

    public function setIsAdmin(bool $isAdmin): self
    {
        $this->isAdmin = $isAdmin;

        return $this;
    }

    public function hasExpired(): bool
    {
        return $this->expiresAt < new \DateTimeImmutable();
    }
}
