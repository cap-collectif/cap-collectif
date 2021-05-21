<?php

namespace Capco\UserBundle\OpenID;

use Capco\AppBundle\Helper\EnvHelper;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OpenIDResourceOwner extends GenericOAuth2ResourceOwner
{
    protected $paths = [
        'identifier' => 'sub',
    ];

    private $instanceName;

    // TODO: please save this configuration in BO instead.
    public function isRefreshingUserInformationsAtEveryLogin(): bool
    {
        switch ($this->getInstanceName()) {
            case 'occitanie':
            case 'occitanie-dedicated':
                return true;
            default:
                return false;
        }
    }

    // TODO: please save this configuration in BO instead.
    public function isUsingAuthorizationHeaderToGetAccessToken(): bool
    {
        switch ($this->getInstanceName()) {
            case 'pe':
            case 'parlons-energies':
                return true;
            default:
                return false;
        }
    }

    // TODO: please save this configuration in BO instead.
    public function getScope(): string
    {
        switch ($this->getInstanceName()) {
            case 'carpentras':
                return 'openid email family_name given_name';
            case 'pe':
            case 'parlons-energies':
                return 'openid email givenName';
            default:
                return 'openid email profile';
        }
    }

    public function getUserInformation(
        array $accessToken,
        array $extraParameters = []
    ): UserResponseInterface {
        $this->paths = (new OpenIDPathMapper(
            EnvHelper::get('SYMFONY_INSTANCE_NAME')
        ))->getOpenIDMapping();

        return parent::getUserInformation($accessToken, $extraParameters);
    }

    public function getAuthorizationUrl($redirectUri, array $extraParameters = []): string
    {
        switch ($this->getInstanceName()) {
            case 'pe':
            case 'parlons-energies':
                $extraParameters = array_merge($extraParameters, [
                    'acr_values' => 'sesameEDF',
                ]);

                break;
            default:
                break;
        }

        return parent::getAuthorizationUrl($redirectUri, $extraParameters);
    }

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);
        $scope = $this->getScope();

        switch ($this->getInstanceName()) {
            case 'carpentras':
                $resolver
                    ->setDefaults([
                        'state' => null,
                        'csrf' => true,
                        'scope' => $scope,
                    ])
                    ->setRequired('logout_url');

                break;
            case 'pe':
            case 'parlons-energies':
                $resolver
                    ->setDefaults([
                        'scope' => $scope,
                        'state' => null,
                        'csrf' => true,
                        'nonce' => $this->generateNonce(),
                    ])
                    ->setRequired('logout_url');

                break;
            default:
                $resolver
                    ->setDefaults([
                        'scope' => $scope,
                    ])
                    ->setRequired('logout_url');

                break;
        }
    }

    protected function doGetTokenRequest($url, array $parameters = [])
    {
        $headers = [];

        if ($this->isUsingAuthorizationHeaderToGetAccessToken()) {
            $headers['Authorization'] =
                'Basic ' .
                base64_encode($this->options['client_id'] . ':' . $this->options['client_secret']);
            unset($parameters['client_id'], $parameters['client_secret']);
        }
        // TODO after hwi update, we will need to set this :
        // $parameters['client_id'] = $this->options['client_id'];
        // $parameters['client_secret'] = $this->options['client_secret'];

        return $this->httpRequest(
            $url,
            http_build_query($parameters, null, '&', \PHP_QUERY_RFC3986),
            $headers
        );
    }

    private function getInstanceName(): string
    {
        if (!$this->instanceName) {
            $this->instanceName = EnvHelper::get('SYMFONY_INSTANCE_NAME');
        }

        return $this->instanceName;
    }
}
