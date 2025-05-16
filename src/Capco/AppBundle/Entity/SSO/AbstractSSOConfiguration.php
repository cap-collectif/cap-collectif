<?php

namespace Capco\AppBundle\Entity\SSO;

use Capco\AppBundle\DBAL\Enum\EnumSSOEnvironmentType;
use Capco\AppBundle\Traits\EnableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="sso_configuration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractSSOConfigurationRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name="ssoType", type="enum_sso_type")
 * @ORM\DiscriminatorMap({
 *      "oauth2"           = "Oauth2SSOConfiguration",
 *      "franceconnect"    = "FranceConnectSSOConfiguration",
 *      "facebook"         = "FacebookSSOConfiguration",
 *      "cas"              = "CASSSOConfiguration"
 * })
 */
abstract class AbstractSSOConfiguration implements EntityInterface
{
    use EnableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="name", type="string", nullable=false)
     */
    protected $name = '';

    /**
     * @ORM\Column(name="profile_url", type="text", nullable=true)
     */
    protected $profileUrl;

    /**
     * @ORM\Column(name="environment", type="enum_sso_environment", nullable=false, options={"default": "NONE"})
     */
    protected $environment = EnumSSOEnvironmentType::NONE;

    protected $ssoType;

    /**
     * @ORM\Column(name="disconnect_sso_on_logout", type="boolean", nullable=false, options={"default" = false})
     */
    protected bool $disconnectSsoOnLogout = false;

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

    public function getSsoType(): string
    {
        return $this->ssoType;
    }

    public function setSsoType(string $ssoType): self
    {
        $this->ssoType = $ssoType;

        return $this;
    }

    public function isDisconnectSsoOnLogout(): bool
    {
        return $this->disconnectSsoOnLogout;
    }

    public function disconnectSsoOnLogout(): bool
    {
        return $this->disconnectSsoOnLogout;
    }

    public function setDisconnectSsoOnLogout(bool $disconnectSsoOnLogout): self
    {
        $this->disconnectSsoOnLogout = $disconnectSsoOnLogout;

        return $this;
    }
}
