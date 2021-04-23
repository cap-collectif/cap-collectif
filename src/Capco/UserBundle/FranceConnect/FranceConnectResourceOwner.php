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
        'nickname' => 'preferred_username',
        'birthplace' => 'birthplace',
    ];

    public function getAuthorizationUrl($redirectUri, array $extraParameters = []): string
    {
        // https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#glossary
        $extraParameters = array_merge($extraParameters, [
            'nonce' => $this->generateNonce(),
            'acr_values' => 'eidas1',
        ]);

        return parent::getAuthorizationUrl($redirectUri, $extraParameters);
    }

    public function getAccessToken(
        HttpRequest $request,
        $redirectUri,
        array $extraParameters = []
    ): array {
        return parent::getAccessToken($request, $redirectUri, $extraParameters);
    }

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);

        $resolver
            ->setDefaults([
                'scope' => $this->getScope(),
            ])
            ->setRequired('logout_url');
    }

    public function getScope(): string
    {
        $allowedData = $this->optionsModifier->getAllowedData();
        $scope =  array_merge(['openid'], $allowedData);

        return implode(' ', $scope);
    }
}
