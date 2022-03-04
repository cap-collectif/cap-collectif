<?php

namespace Capco\UserBundle\Authenticator;

use Capco\UserBundle\Entity\User;
use Hslavich\SimplesamlphpBundle\Exception\MissingSamlAuthAttributeException;
use Hslavich\SimplesamlphpBundle\Security\Core\Authentication\Token\SamlToken;
use Psr\Log\LoggerInterface;
use SimpleSAML\Auth\Simple;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Http\HttpUtils;

class SamlAuthenticator implements SimplePreAuthenticatorInterface
{
    protected Simple $samlAuth;
    protected string $samlIdp;
    protected HttpUtils $httpUtils;
    protected LoggerInterface $logger;

    public function __construct(
        ?Simple $samlAuth,
        string $samlIdp,
        HttpUtils $httpUtils,
        LoggerInterface $logger
    ) {
        $this->samlAuth = $samlAuth;
        $this->samlIdp = $samlIdp;
        $this->httpUtils = $httpUtils;
        $this->logger = $logger;
    }

    public function getAuthenticationAttribute(): string
    {
        if ('daher' === $this->samlIdp) {
            return 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn';
        }

        if ('grandest-preprod' === $this->samlIdp || 'grandest' === $this->samlIdp) {
            return 'email';
        }

        if ('univ-lyon1' === $this->samlIdp) {
            return 'urn:oid:0.9.2342.19200300.100.1.3'; // mail
        }

        if ('cd59' === $this->samlIdp) {
            return 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
        }

        if ('sorbonne' === $this->samlIdp) {
            return 'mail';
        }

        if ('dev' === $this->samlIdp) {
            return 'https://samltest.id/attributes/role';
        }

        throw new \Exception('Could not find authentication attribute for idp: ' . $this->samlIdp);
    }

    public function findUsernameInResponse(array $attributes)
    {
        $authAttribute = $this->getAuthenticationAttribute();
        if (!isset($attributes[$authAttribute])) {
            throw new MissingSamlAuthAttributeException(
                sprintf(
                    "Attribute '%s' was not found in SAMLResponse '%s'",
                    $authAttribute,
                    print_r($attributes, true)
                )
            );
        }

        return $attributes[$authAttribute][0];
    }

    public function createToken(Request $request, $providerKey)
    {
        $isOnLoginUrl = $this->httpUtils->checkRequestPath($request, '/login-saml');
        if (!$isOnLoginUrl && !$this->samlAuth->isAuthenticated()) {
            return null; // skip saml auth, to let users browse anonymously
        }

        $this->samlAuth->requireAuth(); // force the user to login with SAML
        $attributes = $this->samlAuth->getAttributes();

        $this->logger->info('Creating SAML token from: ' . json_encode($attributes));

        $username = $this->findUsernameInResponse($attributes);
        $token = new SamlToken($username);
        $token->setAttributes($attributes);

        return $token;
    }

    public function authenticateToken(
        TokenInterface $token,
        UserProviderInterface $userProvider,
        $providerKey
    ): SamlToken {
        $username = $token->getUsername();
        $user = $userProvider->loadUserByUsername($username);

        if ($user instanceof User) {
            $user->setSamlAttributes($this->samlIdp, $token->getAttributes());
        }

        $authenticatedToken = new SamlToken($user, $user->getRoles());
        $authenticatedToken->setAttributes($token->getAttributes());

        return $authenticatedToken;
    }

    public function supportsToken(TokenInterface $token, $providerKey): bool
    {
        return $token instanceof SamlToken;
    }
}
