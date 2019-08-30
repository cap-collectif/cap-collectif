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
 *      "oauth2"           = "Oauth2SSOConfiguration",
 *      "franceconnect"    = "FranceConnectSSOConfiguration"
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

    /**
     * @ORM\Column(name="button_color", type="string", length=7, nullable=false, options={"default": "#7498C0"})
     */
    protected $buttonColor = '#FFFFF';

    /**
     * @ORM\Column(name="label_color", type="string", length=7, nullable=false, options={"default": "#FFFFFF"})
     */
    protected $labelColor = '#FFFFFF';

    /**
     * @ORM\Column(name="environment", type="enum_sso_environment", nullable=false, options={"default": ""})
     */
    protected $environment = '';

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

    public function setProfileUrl(?string $profileUrl = null): self
    {
        $this->profileUrl = $profileUrl;

        return $this;
    }

    public function getButtonColor(): string
    {
        return $this->buttonColor;
    }

    public function setButtonColor(string $buttonColor): self
    {
        $this->buttonColor = $buttonColor;

        return $this;
    }

    public function getLabelColor(): string
    {
        return $this->labelColor;
    }

    public function setLabelColor(string $labelColor = null): void
    {
        $this->labelColor = $labelColor;
    }

    public function getKind(): string
    {
        return 'oauth2';
    }

    public function getEnvironment(): ?string
    {
        return $this->environment;
    }

    public function setEnvironment(?string $environment = null): self
    {
        $this->environment = $environment;

        return $this;
    }

    abstract public function getSsoType(): string;
}
