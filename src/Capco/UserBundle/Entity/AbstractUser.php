<?php

namespace Capco\Capco\UserBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use FOS\UserBundle\Model\User as FosUser;

/**
 * copied from Sonata User.
 */
abstract class AbstractUser extends FosUser
{
    use TimestampableTrait;
    protected ?\DateTime $updatedAt = null;
    protected ?string $website = null;
    protected ?string $biography = null;
    protected ?string $gender = null;

    public function __construct()
    {
        parent::__construct();
        $this->createdAt = new \DateTime();
    }

    public function __toString(): string
    {
        return $this->getUsername() ?: '-';
    }

    public function setBiography(?string $biography): self
    {
        $this->biography = $biography;

        return $this;
    }

    public function getBiography(): ?string
    {
        return $this->biography;
    }

    public function setGender(?string $gender): self
    {
        $this->gender = $gender;

        return $this;
    }

    public function getGender(): ?string
    {
        return $this->gender;
    }

    public function setWebsite(?string $website): self
    {
        $this->website = $website;

        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function getRealRoles(): array
    {
        return $this->roles;
    }

    public function setRealRoles(array $roles): self
    {
        $this->setRoles($roles);

        return $this;
    }

    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }
}
