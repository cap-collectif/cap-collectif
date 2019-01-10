<?php

namespace Capco\UserBundle\OpenID;

use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Capco\AppBundle\Helper\EnvHelper;

class OpenIDResourceOwner extends GenericOAuth2ResourceOwner
{
    protected $paths = [
        'identifier' => 'sub',
        'username' => 'name',
        'nickname' => 'name',
        'realname' => 'name',
        'email' => 'email',
    ];

    public function getUserInformation(array $accessToken, array $extraParameters = [])
    {
        // If instance is Nantes OpenID.
        if ('nantes' === EnvHelper::get('SYMFONY_INSTANCE_NAME')) {
            $this->paths = [
                'identifier' => 'sub',
                'email' => 'email',
                'nickname' => ['given_name', 'family_name'],
            ];
        }

        return parent::getUserInformation($accessToken, $extraParameters);
    }

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'scope' => 'openid email profile',
        ]);
    }
}
