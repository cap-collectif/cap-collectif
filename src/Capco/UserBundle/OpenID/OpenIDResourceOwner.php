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
        switch ($this->instanceName) {
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

        $defaultScope = 'openid email profile';
        $this->instanceName = EnvHelper::get('SYMFONY_INSTANCE_NAME');

        switch ($this->instanceName) {
            case 'carpentras':
                $resolver
                    ->setDefaults([
                        'state' => null,
                        'csrf' => true,
                        'scope' => 'openid email family_name given_name',
                    ])
                    ->setRequired('logout_url');

                break;
            case 'pe':
            case 'parlons-energies':
                $resolver
                    ->setDefaults([
                        'scope' => 'openid email givenName',
                        'state' => null,
                        'csrf' => true,
                        'nonce' => $this->generateNonce(),
                    ])
                    ->setRequired('logout_url');

                break;
            default:
                $resolver
                    ->setDefaults([
                        'scope' => $defaultScope,
                    ])
                    ->setRequired('logout_url');

                break;
        }
    }

    protected function doGetTokenRequest($url, array $parameters = [])
    {
        $headers = [];

        switch ($this->instanceName) {
            case 'pe':
            case 'parlons-energies':
                // Cf "use_authorization_to_get_token" option
                $headers['Authorization'] =
                    'Basic ' .
                    base64_encode(
                        $this->options['client_id'] . ':' . $this->options['client_secret']
                    );
                unset($parameters['client_id'], $parameters['client_secret']);

                break;
            default:
                // TODO after hwi update, we will need to set this :
                // $parameters['client_id'] = $this->options['client_id'];
                // $parameters['client_secret'] = $this->options['client_secret'];
                break;
        }

        return $this->httpRequest(
            $url,
            http_build_query($parameters, null, '&', \PHP_QUERY_RFC3986),
            $headers
        );
    }
}
