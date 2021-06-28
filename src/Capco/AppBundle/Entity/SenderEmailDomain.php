<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\SenderEmailDomainRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=SenderEmailDomainRepository::class)
 * @ORM\Table(name="sender_email_domain", uniqueConstraints={@ORM\UniqueConstraint(columns={"value", "service"})})
 */
class SenderEmailDomain
{
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $value;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $service;

    private bool $spfValidation = false;
    private bool $dkimValidation = false;

    public function getValue(): string
    {
        return $this->value;
    }

    public function setValue(string $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getService(): string
    {
        return $this->service;
    }

    public function setService(string $service): self
    {
        if (!\in_array($service, ExternalServiceConfiguration::AVAILABLE_VALUES['mailer'])) {
            throw new \Exception(__METHOD__ . " : invalid service ${service}");
        }
        $this->service = $service;

        return $this;
    }

    public function getSpfValidation(): bool
    {
        return $this->spfValidation;
    }

    public function setSpfValidation(bool $spfValidation): self
    {
        $this->spfValidation = $spfValidation;

        return $this;
    }

    public function getDkimValidation(): bool
    {
        return $this->dkimValidation;
    }

    public function setDkimValidation(bool $dkimValidation): self
    {
        $this->dkimValidation = $dkimValidation;

        return $this;
    }
}
