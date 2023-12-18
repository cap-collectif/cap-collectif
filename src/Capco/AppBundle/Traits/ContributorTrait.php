<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Traits\User\UserAddressTrait;
use Doctrine\ORM\Mapping as ORM;

trait ContributorTrait
{
    use UserAddressTrait;

    /**
     * @ORM\Column(name="lastname", type="string", length=255, nullable=true)
     */
    private ?string $lastname = null;

    /**
     * @ORM\Column(name="firstname", type="string", length=255, nullable=true)
     */
    private ?string $firstname = null;

    /**
     * @ORM\Column(name="phone", type="string", length=255, nullable=true)
     */
    private ?string $phone = null;

    /**
     * @ORM\Column(name="date_of_birth", type="datetime", nullable=true)
     */
    private ?\DateTime $dateOfBirth = null;

    /**
     * @ORM\Column(name="phone_confirmed", type="boolean")
     */
    private bool $phoneConfirmed = false;

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(?string $lastname): self
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(?string $firstname): self
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    public function getDateOfBirth(): ?\DateTimeInterface
    {
        return $this->dateOfBirth;
    }

    public function setDateOfBirth(?\DateTimeInterface $dateOfBirth): self
    {
        $this->dateOfBirth = $dateOfBirth;

        return $this;
    }

    public function isPhoneConfirmed(): bool
    {
        return $this->phoneConfirmed;
    }

    public function setPhoneConfirmed(bool $phoneConfirmed): self
    {
        $this->phoneConfirmed = $phoneConfirmed;

        return $this;
    }
}
