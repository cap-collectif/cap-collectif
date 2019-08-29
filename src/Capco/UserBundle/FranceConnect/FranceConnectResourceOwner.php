<?php

namespace Capco\UserBundle\FranceConnect;

use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use Symfony\Component\OptionsResolver\OptionsResolver;

class FranceConnectResourceOwner extends GenericOAuth2ResourceOwner
{
    protected $paths = [
        'identifier' => 'sub',
        'email' => 'email',
        'firstname' => 'given_name',
        'lastname' => 'family_name',
        'nickname' => 'preferred_username'
    ];

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);

        $resolver
            ->setDefaults([
                'scope' => 'openid email profile'
            ])
            ->setRequired('logout_url');
    }
}
