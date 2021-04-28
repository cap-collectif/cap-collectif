<?php

namespace Capco\UserBundle\OpenID;

use Capco\AppBundle\Helper\EnvHelper;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OpenIDResourceOwner extends GenericOAuth2ResourceOwner
{
    protected $paths = [
        'identifier' => 'sub'
    ];

    public function getUserInformation(
        array $accessToken,
        array $extraParameters = []
    ): UserResponseInterface {
        $this->paths = (new OpenIDPathMapper(
            EnvHelper::get('SYMFONY_INSTANCE_NAME')
        ))->getOpenIDMapping();

        return parent::getUserInformation($accessToken, $extraParameters);
    }

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);

        $defaultScope = 'openid email profile';

        $instanceName = EnvHelper::get('SYMFONY_INSTANCE_NAME');
        switch ($instanceName) {
            case 'carpentras':
                $resolver->setDefaults([
                    'state'  => null,
                    'csrf' => true,               
                    'scope' => 'openid email family_name given_name'
                ])
                ->setRequired('logout_url');
                break;
            default:
                $resolver
                    ->setDefaults([
                        'scope' => $defaultScope
                    ])
                    ->setRequired('logout_url');
                break;
        }

    }

    protected function doGetTokenRequest($url, array $parameters = [])
    {
        return $this->httpRequest(
            $url,
            http_build_query($parameters, null, '&', \PHP_QUERY_RFC3986)
        );
    }
}
