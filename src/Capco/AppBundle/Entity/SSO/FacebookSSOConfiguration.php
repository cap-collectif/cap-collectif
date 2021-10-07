<?php

namespace Capco\AppBundle\Entity\SSO;

use Capco\AppBundle\Enum\SSOType;
use Doctrine\ORM\Mapping as ORM;

/**
 * Use this class for Facebook configuration.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\FacebookSSOConfigurationRepository")
 */
class FacebookSSOConfiguration extends AbstractSSOConfiguration
{
    /**
     * @ORM\Column(name="client_id", type="string", nullable=false)
     */
    protected string $clientId = '';

    /**
     * @ORM\Column(name="secret", type="string", nullable=false)
     */
    protected string $secret = '';

    public function getClientId(): ?string
    {
        return $this->clientId;
    }

    public function setClientId(string $clientId): self
    {
        $this->clientId = $clientId;

        return $this;
    }

    public function getSecret(): ?string
    {
        return $this->secret;
    }

    public function setSecret(string $secret): self
    {
        $this->secret = $secret;

        return $this;
    }

    public function getSsoType(): string
    {
        return SSOType::FACEBOOK;
    }
}
