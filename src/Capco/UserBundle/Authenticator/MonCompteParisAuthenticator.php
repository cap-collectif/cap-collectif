<?php

namespace Capco\UserBundle\Authenticator;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Http\HttpUtils;

class MonCompteParisAuthenticator implements SimplePreAuthenticatorInterface
{
    protected $httpUtils;
    protected $logger;
    protected $baseApiUrl = 'https://moncompte.paris.fr/v69/json/';

    public function __construct(HttpUtils $httpUtils, LoggerInterface $logger)
    {
        $this->httpUtils = $httpUtils;
        $this->logger = $logger;
    }

    public function findUsernameInResponse(array $attributes)
    {
        return $attributes['result']['token'];
    }

    public function createToken(Request $request, $providerKey)
    {
        $isOnLoginUrl = $this->httpUtils->checkRequestPath($request, '/login-paris');
        $isAlreadyAuthenticated = false;

        $cookies = $request->cookies;
        // http://fr.lutece.paris.fr/fr/wiki/user-information.html
        if ($cookies->has('mcpAuth')) { // Iplanetdirectorypro in test env
            $isAlreadyAuthenticated = true;
        }

        if (!$isOnLoginUrl && !$isAlreadyAuthenticated) {
            return null; // skip paris auth, to let users browse anonymously
        }

        $username = $this->getUidFromCookie($cookies->get('mcpAuth'));
        $this->logger->info('Creating Paris token for username: ' . $username);

        $token = new SamlToken($username);
        $token->setAttributes([]);

        return $token;
    }

    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)//: SamlToken
    {
        $username = $token->getUsername();
        $user = $userProvider->loadUserByUsername($username);

        $user->setSamlAttributes($this->samlIdp, $token->getAttributes());

        $authenticatedToken = new SamlToken($user, $user->getRoles());
        $authenticatedToken->setAttributes($token->getAttributes());

        return $authenticatedToken;
    }

    public function supportsToken(TokenInterface $token, $providerKey): bool
    {
        return $token instanceof SamlToken;
    }

    private function getUidFromCookie(string $cookie): string
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baseUrl . '/sessions/' . $cookie . '?_action=validate');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);

        $headers = [];
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);

        $json = json_encode($result);

        return $json['uid'];
    }
}
