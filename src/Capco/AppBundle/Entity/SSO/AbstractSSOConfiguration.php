<?php

namespace Capco\AppBundle\Entity\SSO;

use Capco\AppBundle\Traits\EnableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="sso_configuration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractSSOConfigurationRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "ssoType", type = "string")
 * @ORM\DiscriminatorMap({
 *      "oauth2"           = "Oauth2SSOConfiguration"
 * })
 */
abstract class AbstractSSOConfiguration
{
    use UuidTrait;
    use EnableTrait;

    /**
     * @ORM\Column(name="name", type="string", nullable=false)
     */
    protected $name = '';

    /**
     * @ORM\Column(name="profile_url", type="text", nullable=true)
     */
    protected $profileUrl;

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getProfileUrl(): ?string
    {
        return $this->profileUrl;
    }

    public function setProfileUrl(?string $profileUrl = null): void
    {
        $this->profileUrl = $profileUrl;
    }

    public function getKind(): string
    {
        return 'oauth2';
    }
}
