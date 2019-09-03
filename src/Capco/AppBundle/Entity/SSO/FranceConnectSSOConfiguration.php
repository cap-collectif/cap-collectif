<?php

namespace Capco\AppBundle\Entity\SSO;

use Capco\AppBundle\DBAL\Enum\EnumSSOEnvironmentType;
use Doctrine\ORM\Mapping as ORM;

/**
 * Use this class for France Connect configuration.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository")
 */
class FranceConnectSSOConfiguration extends AbstractSSOConfiguration
{
    public const ENDPOINTS = [
        EnumSSOEnvironmentType::TESTING => 'https://fcp.integ01.dev-franceconnect.fr',
        EnumSSOEnvironmentType::PRODUCTION => 'https://app.franceconnect.gouv.fr'
    ];

    public const ROUTES = [
        'authorizationUrl' => '/api/v1/authorize',
        'accessTokenUrl' => '/api/v1/token',
        'userInfoUrl' => '/api/v1/userinfo',
        'logoutUrl' => '/api/v1/logout'
    ];

    /**
     * @ORM\Column(name="client_id", type="string", nullable=false)
     */
    protected $clientId = '';

    /**
     * @ORM\Column(name="secret", type="string", nullable=false)
     */
    protected $secret = '';

    /**
     * @ORM\Column(name="authorization_url", type="text", nullable=false)
     */
    protected $authorizationUrl = '/api/v1/authorize';

    /**
     * @ORM\Column(name="access_token_url", type="text", nullable=false)
     */
    protected $accessTokenUrl = '/api/v1/token';

    /**
     * @ORM\Column(name="user_info_url", type="text", nullable=false)
     */
    protected $userInfoUrl = '/api/v1/userinfo';

    /**
     * @ORM\Column(name="logout_url", type="text", nullable=true)
     */
    protected $logoutUrl = '/api/v1/logout';

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

    public function getAuthorizationUrl(): string
    {
        return $this->authorizationUrl;
    }

    public function setAuthorizationUrl(string $authorizationUrl): self
    {
        $this->authorizationUrl = $authorizationUrl;

        return $this;
    }

    public function getAccessTokenUrl(): string
    {
        return $this->accessTokenUrl;
    }

    public function setAccessTokenUrl(string $accessTokenUrl): self
    {
        $this->accessTokenUrl = $accessTokenUrl;

        return $this;
    }

    public function getUserInfoUrl(): string
    {
        return $this->userInfoUrl;
    }

    public function setUserInfoUrl(string $userInfoUrl): self
    {
        $this->userInfoUrl = $userInfoUrl;

        return $this;
    }

    public function getLogoutUrl(): ?string
    {
        return $this->logoutUrl;
    }

    public function setLogoutUrl(?string $logoutUrl = null): self
    {
        $this->logoutUrl = $logoutUrl;

        return $this;
    }

    public function getSsoType(): string
    {
        return 'franceconnect';
    }
}
