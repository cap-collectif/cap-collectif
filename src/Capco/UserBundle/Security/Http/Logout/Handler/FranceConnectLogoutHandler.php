<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class FranceConnectLogoutHandler implements LogoutHandlerInterface
{
    private Manager $toggleManager;
    private ResourceOwnerInterface $resourceOwner;
    private TokenStorageInterface $tokenStorage;

    public function __construct(
        Manager $toggleManager,
        ResourceOwnerInterface $resourceOwner,
        TokenStorageInterface $tokenStorage
    ) {
        $this->toggleManager = $toggleManager;
        $this->resourceOwner = $resourceOwner;
        $this->tokenStorage = $tokenStorage;
    }

    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        $token = $this->tokenStorage->getToken();
        // This if statement help to not trigger France Connect logout redirection
        // when a user was logged in with another workflow (classic auth, facebook, etc...).
        if (
            $token &&
            $token instanceof OAuthToken &&
            'franceconnect' === $token->getResourceOwnerName() &&
            $this->toggleManager->isActive('login_franceconnect')
        ) {
            $logoutURL = $this->getLogoutUrl($responseWithRequest->getResponse()->getTargetUrl());

            $responseWithRequest->setResponse(new RedirectResponse($logoutURL));
        }

        return $responseWithRequest;
    }

    public function getLogoutUrl(string $redirectUrl, ?User $user = null): string
    {
        $logoutURL = $this->resourceOwner->getOption('logout_url');

        $parameters = [
            'post_logout_redirect_uri' => $redirectUrl,
            'state' => $this->generateNonce(),
            'id_token_hint' => $this->getIdToken($user),
        ];

        return $logoutURL . '?' . http_build_query($parameters, '', '&') ?? '/';
    }

    private function generateNonce(): string
    {
        return md5(microtime(true) . uniqid('', true));
    }

    private function getIdToken(?User $user = null): string
    {
        if ($user && $user->getFranceConnectIdToken()) {
            return $user->getFranceConnectIdToken();
        }

        return $this->tokenStorage->getToken()->getRawToken()['id_token'];
    }
}
