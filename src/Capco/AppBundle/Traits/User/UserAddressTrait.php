<?php

namespace Capco\AppBundle\Traits\User;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Doctrine\ORM\Mapping as ORM;

trait UserAddressTrait
{
    /**
     * @ORM\Column(name="postal_address", type="text", nullable=true)
     */
    protected ?string $postalAddress = null;

    protected ?string $address = null;
    protected ?string $address2 = null;

    protected ?string $zipCode = null;
    protected ?string $neighborhood = null;
    protected ?string $city = null;

    public function getPostalAddress(): ?GoogleMapsAddress
    {
        if ($this->postalAddress) {
            return GoogleMapsAddress::fromApi($this->postalAddress);
        }

        return null;
    }

    public function getPostalAddressAsJSON(): ?string
    {
        return $this->postalAddress;
    }

    public function setPostalAddress(?string $postalAddress): self
    {
        $this->postalAddress = $postalAddress;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): self
    {
        $this->address = $address;

        return $this;
    }

    public function getAddress2(): ?string
    {
        return $this->address2;
    }

    public function setAddress2(?string $address2): void
    {
        $this->address2 = $address2;
    }

    public function getZipCode(): ?string
    {
        return $this->zipCode;
    }

    public function setZipCode(?string $zipCode): self
    {
        $this->zipCode = $zipCode;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): void
    {
        $this->city = $city;
    }

    public function getNeighborhood(): ?string
    {
        return $this->neighborhood;
    }

    public function setNeighborhood(?string $neighborhood): void
    {
        $this->neighborhood = $neighborhood;
    }
}
