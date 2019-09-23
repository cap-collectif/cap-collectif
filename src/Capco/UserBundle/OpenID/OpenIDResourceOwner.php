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

        $resolver
            ->setDefaults([
                'scope' => 'openid email profile',
            ])
            ->setRequired('logout_url');
    }
}
