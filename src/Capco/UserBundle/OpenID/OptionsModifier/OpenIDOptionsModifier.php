<?php

namespace Capco\UserBundle\OpenID\OptionsModifier;

use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\AbstractOptionsModifier;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\OptionsModifierInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;

class OpenIDOptionsModifier extends AbstractOptionsModifier implements OptionsModifierInterface
{
    protected $oauthSsoConfigurationRepository;

    public function __construct(Oauth2SSOConfigurationRepository $oauthSsoConfigurationRepository)
    {
        $this->oauthSsoConfigurationRepository = $oauthSsoConfigurationRepository;
    }

    public function modifyOptions(array $options, ResourceOwnerInterface $resourceOwner): array
    {
        $ssoConfiguration = $this->oauthSsoConfigurationRepository->findOneBy([
            'enabled' => true,
        ]);

        if (!$ssoConfiguration) {
            throw new \RuntimeException('Could not find SSO configuration.');
        }

        return array_merge($options, [
            'client_id' => $ssoConfiguration->getClientId(),
            'client_secret' => $ssoConfiguration->getSecret(),
            'access_token_url' => $ssoConfiguration->getAccessTokenUrlId(),
            'authorization_url' => $ssoConfiguration->getAuthorizationUrl(),
            'infos_url' => $ssoConfiguration->getUserInfoUrl(),
            'logout_url' => $ssoConfiguration->getLogoutUrl(),
        ]);
    }
}
