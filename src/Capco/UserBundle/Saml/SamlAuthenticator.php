<?php

namespace Capco\UserBundle\Saml;

use Capco\AppBundle\Toggle\Manager;
use Hslavich\SimplesamlphpBundle\Exception\MissingSamlAuthAttributeException;
use Hslavich\SimplesamlphpBundle\Security\Core\Authentication\Token\SamlToken;
use SimpleSAML\Auth\Simple;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Http\HttpUtils;

class SamlAuthenticator implements SimplePreAuthenticatorInterface
{
    protected $samlAuth;
    protected $samlIdp;
    protected $httpUtils;
    protected $toggleManager;

    public function __construct(Simple $samlAuth, string $samlIdp, HttpUtils $httpUtils, Manager $toggleManager)
    {
        $this->samlAuth = $samlAuth;
        $this->samlIdp = $samlIdp;
        $this->httpUtils = $httpUtils;
        $this->toggleManager = $toggleManager;
    }

    public function getAuthenticationAttribute()
    {
        if ('oda' === $this->samlIdp) {
            return 'oda_id';
        }
        if ('daher' === $this->samlIdp) {
            return 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn';
        }

        if ('afd-interne' === $this->samlIdp) {
            return 'mail';
        }

        if ('pole-emploi' === $this->samlIdp) {
            return 'mail';
        }

        throw new \Exception('Could not find your authentication attribute.');
    }

    public function findUsernameInResponse(array $attributes)
    {
        $authAttribute = $this->getAuthenticationAttribute();
        if (!array_key_exists($authAttribute, $attributes)) {
            throw new MissingSamlAuthAttributeException(
                sprintf("Attribute '%s' was not found in SAMLResponse '%s'", $authAttribute, print_r($attributes, true))
            );
        }

        return $attributes[$authAttribute][0];
    }

    public function createToken(Request $request, $providerKey)
    {
        if (!$this->toggleManager->isActive('login_saml')) {
            return null;
        }

        $isOnLoginUrl = $this->httpUtils->checkRequestPath($request, '/login-saml');
        if (!$isOnLoginUrl && !$this->samlAuth->isAuthenticated()) {
            return null; // skip saml auth, to let users browse anonymously
        }

        $this->samlAuth->requireAuth(); // force the user to login with SAML
        $attributes = $this->samlAuth->getAttributes();

        $username = $this->findUsernameInResponse($attributes);
        $token = new SamlToken($username);
        $token->setAttributes($attributes);

        return $token;
    }

    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)
    {
        $username = $token->getUsername();
        $user = $userProvider->loadUserByUsername($username);

        $user->setSamlAttributes($this->samlIdp, $token->getAttributes());

        $authenticatedToken = new SamlToken($user, $user->getRoles());
        $authenticatedToken->setAttributes($token->getAttributes());

        return $authenticatedToken;
    }

    public function supportsToken(TokenInterface $token, $providerKey)
    {
        return $token instanceof SamlToken;
    }
}
