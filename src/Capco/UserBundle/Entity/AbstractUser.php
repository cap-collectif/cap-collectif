<?php

namespace Capco\Capco\UserBundle\Entity;

use FOS\UserBundle\Model\User as FosUser;

/**
 * copied from Sonata User.
 */
abstract class AbstractUser extends FosUser
{
    protected \DateTime $createdAt;
    protected ?\DateTime $updatedAt = null;
    protected ?\DateTime $dateOfBirth = null;
    protected ?string $firstname = null;
    protected ?string $lastname = null;
    protected ?string $website = null;
    protected ?string $biography = null;
    protected ?string $gender = null;
    protected ?string $phone = null;
    protected ?string $locale = null;

    public function __construct()
    {
        parent::__construct();
        $this->createdAt = new \DateTime();
    }

    public function __toString(): string
    {
        return $this->getUsername() ?: '-';
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt = null): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setGroups(iterable $groups): self
    {
        foreach ($groups as $group) {
            $this->addGroup($group);
        }

        return $this;
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

    public function setDateOfBirth(?\DateTime $dateOfBirth): self
    {
        $this->dateOfBirth = $dateOfBirth;

        return $this;
    }

    public function getDateOfBirth(): ?\DateTime
    {
        return $this->dateOfBirth;
    }

    public function setFirstname(?string $firstname): self
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
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

    public function setLastname(?string $lastname): self
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLocale(?string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }

    public function getLocale(): ?string
    {
        return $this->locale;
    }

    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
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
