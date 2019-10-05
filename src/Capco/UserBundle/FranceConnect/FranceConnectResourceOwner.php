<?php

namespace Capco\UserBundle\FranceConnect;

use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use Symfony\Component\HttpFoundation\Request as HttpRequest;
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

    public function getAuthorizationUrl($redirectUri, array $extraParameters = []): string
    {
        // https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#glossary
        $extraParameters = array_merge(
            [
                'nonce' => $this->generateNonce()
            ],
            $extraParameters
        );

        // Uncomment it if you want test France Connect with local mode.
        // $redirectUri = 'http://localhost:4242/callback';

        return parent::getAuthorizationUrl($redirectUri, $extraParameters);
    }

    public function getAccessToken(
        HttpRequest $request,
        $redirectUri,
        array $extraParameters = []
    ): array {
        // Uncomment it if you want test France Connect with local mode.
        /* $extraParameters = array_merge(
            [
                'redirect_uri' => 'http://localhost:4242/callback'
            ],
            $extraParameters
        ); */

        return parent::getAccessToken($request, $redirectUri, $extraParameters);
    }

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
