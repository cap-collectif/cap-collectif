<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\SenderEmailRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=SenderEmailRepository::class)
 * @ORM\Table(name="sender_email", uniqueConstraints={@ORM\UniqueConstraint(columns={"locale", "domain"})})
 */
class SenderEmail
{
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $locale;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $domain;

    /**
     * @ORM\Column(name="is_default", type="boolean", options={"default": false})
     */
    private bool $isDefault = false;

    public function getLocale(): string
    {
        return $this->locale;
    }

    public function setLocale(string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }

    public function getDomain(): string
    {
        return $this->domain;
    }

    public function setDomain(string $domain): self
    {
        $this->domain = $domain;

        return $this;
    }

    public function isDefault(): bool
    {
        return $this->isDefault;
    }

    public function setIsDefault(bool $isDefault): self
    {
        $this->isDefault = $isDefault;

        return $this;
    }

    public function getAddress(): string
    {
        return $this->getLocale() . '@' . $this->getDomain();
    }
}
