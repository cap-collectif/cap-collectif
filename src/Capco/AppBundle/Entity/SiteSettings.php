<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\SiteSettingsStatus;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="site_settings")
 * @ORM\Entity(repositoryClass=SiteSettingsRepository::class)
 */
class SiteSettings implements EntityInterface
{
    use UuidTrait;

    private string $capcoDomain;

    /**
     * @ORM\Column(type="string", name="custom_domain", length=255, nullable=true)
     */
    private ?string $customDomain = null;

    /**
     * @ORM\Column(type="string", name="status", options={"default" = "IDLE"})
     * @Assert\Choice(choices = {"IDLE", "PENDING", "ACTIVE"})
     */
    private string $status = SiteSettingsStatus::IDLE;

    public function getCapcoDomain(): string
    {
        return getenv('SYMFONY_INSTANCE_NAME') . '.cap-collectif.com';
    }

    public function getCustomDomain(): ?string
    {
        return $this->customDomain;
    }

    public function setCustomDomain(?string $customDomain): self
    {
        $this->customDomain = $customDomain;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }
}
