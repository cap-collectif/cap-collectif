<?php

namespace Capco\AppBundle\Entity\SSO;

use Doctrine\ORM\Mapping as ORM;

/**
 * Use this class for both OpenID and Oauth2 configuration.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository")
 */
class Oauth2SSOConfiguration extends AbstractSSOConfiguration
{
    /**
     * @ORM\Column(name="client_id", type="string", nullable=false)
     */
    protected $clientId;

    /**
     * @ORM\Column(name="secret", type="string", nullable=false)
     */
    protected $secret;

    /**
     * @ORM\Column(name="authorization_url", type="text", nullable=false)
     */
    protected $authorizationUrl;

    /**
     * @ORM\Column(name="access_token_url", type="text", nullable=false)
     */
    protected $accessTokenUrl;

    /**
     * @ORM\Column(name="user_info_url", type="text", nullable=false)
     */
    protected $userInfoUrl;

    /**
     * @ORM\Column(name="logout_url", type="text", nullable=false)
     */
    protected $logoutUrl;

    public function getClientId(): string
    {
        return $this->clientId;
    }

    public function setClientId(string $clientId): self
    {
        $this->clientId = $clientId;

        return $this;
    }

    public function getSecret(): string
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

    public function getLogoutUrl(): string
    {
        return $this->logoutUrl;
    }

    public function setLogoutUrl(string $logoutUrl): self
    {
        $this->logoutUrl = $logoutUrl;

        return $this;
    }
}
