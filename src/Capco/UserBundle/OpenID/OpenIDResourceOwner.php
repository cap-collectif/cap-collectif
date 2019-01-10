<?php

namespace Capco\UserBundle\OpenID;

use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OpenIDResourceOwner extends GenericOAuth2ResourceOwner
{
    protected $paths = [
        'identifier' => 'sub',
        'username' => 'name',
        'nickname' => 'name',
        'realname' => 'name',
        'email' => 'email',
    ];

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'scope' => 'openid email profile',
        ]);
    }
}
