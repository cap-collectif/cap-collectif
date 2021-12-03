<?php

namespace Capco\AppBundle\Entity\Security;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_identification_code")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Security\UserIdentificationCodeRepository")
 */
class UserIdentificationCode
{
    /**
     * @ORM\Id
     * @ORM\Column(name="identification_code", type="string", unique=true, nullable=false)
     */
    private string $identificationCode;

    /**
     * @ORM\ManyToOne(targetEntity="UserIdentificationCodeList", inversedBy="codes")
     * @ORM\JoinColumn(name="list_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private ?UserIdentificationCodeList $list;

    /**
     * @ORM\Column(name="title", type="string", nullable=true)
     */
    private ?string $title;

    /**
     * @ORM\Column(name="firstname", type="string", nullable=true)
     */
    private ?string $firstname;

    /**
     * @ORM\Column(name="lastname", type="string", nullable=true)
     */
    private ?string $lastname;

    /**
     * @ORM\Column(name="address1", type="string", nullable=true)
     */
    private ?string $address1;

    /**
     * @ORM\Column(name="address2", type="string", nullable=true)
     */
    private ?string $address2;

    /**
     * @ORM\Column(name="address3", type="string", nullable=true)
     */
    private ?string $address3;

    /**
     * @ORM\Column(name="zip_code", type="string", nullable=true)
     */
    private ?string $zipCode;

    /**
     * @ORM\Column(name="city", type="string", nullable=true)
     */
    private ?string $city;

    /**
     * @ORM\Column(name="country", type="string", nullable=true)
     */
    private ?string $country;

    /**
     * @ORM\Column(name="email", type="string", nullable=true)
     */
    private ?string $email;

    public function getIdentificationCode(): string
    {
        return $this->identificationCode;
    }

    public function setIdentificationCode(string $identificationCode): self
    {
        $this->identificationCode = $identificationCode;

        return $this;
    }

    public function getList(): ?UserIdentificationCodeList
    {
        return $this->list;
    }

    public function setList(?UserIdentificationCodeList $list): self
    {
        $this->list = $list;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): self
    {
        $this->title = $title;

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

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(?string $lastname): self
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getAddress1(): ?string
    {
        return $this->address1;
    }

    public function setAddress1(?string $address1): self
    {
        $this->address1 = $address1;

        return $this;
    }

    public function getAddress2(): ?string
    {
        return $this->address2;
    }

    public function setAddress2(?string $address2): self
    {
        $this->address2 = $address2;

        return $this;
    }

    public function getAddress3(): ?string
    {
        return $this->address3;
    }

    public function setAddress3(?string $address3): self
    {
        $this->address3 = $address3;

        return $this;
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

    public function setCity(?string $city): self
    {
        $this->city = $city;

        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(?string $country): self
    {
        $this->country = $country;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function hydrate(array $data): self
    {
        if (isset($data['title'])) {
            $this->setTitle($data['title']);
        }
        if (isset($data['firstname'])) {
            $this->setFirstname($data['firstname']);
        }
        if (isset($data['lastname'])) {
            $this->setLastname($data['lastname']);
        }
        if (isset($data['address1'])) {
            $this->setAddress1($data['address1']);
        }
        if (isset($data['address2'])) {
            $this->setAddress2($data['address2']);
        }
        if (isset($data['address3'])) {
            $this->setAddress3($data['address3']);
        }
        if (isset($data['zipCode'])) {
            $this->setZipCode($data['zipCode']);
        }
        if (isset($data['city'])) {
            $this->setCity($data['city']);
        }
        if (isset($data['country'])) {
            $this->setCountry($data['country']);
        }

        return $this;
    }
}
