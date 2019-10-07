<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class FranceConnectLogoutHandler implements LogoutHandlerInterface
{
    private $toggleManager;
    private $resourceOwner;
    private $router;
    private $tokenStorage;
    private $environment;

    public function __construct(
        Manager $toggleManager,
        ResourceOwnerInterface $resourceOwner,
        RouterInterface $router,
        TokenStorageInterface $tokenStorage,
        string $environment
    ) {
        $this->toggleManager = $toggleManager;
        $this->resourceOwner = $resourceOwner;
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
        $this->environment = $environment;
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
            $logoutURL = $this->resourceOwner->getOption('logout_url');

            $homepageUrl =
                'prod' === $this->environment
                    ? $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
                    : 'http://localhost:4242/logout';

            $parameters = [
                'post_logout_redirect_uri' => $homepageUrl,
                'state' => $this->generateNonce(),
                'id_token_hint' => $token->getRawToken()['id_token']
            ];

            $responseWithRequest->setResponse(
                new RedirectResponse(
                    $logoutURL . '?' . http_build_query($parameters, '', '&') ?? '/'
                )
            );
        }

        return $responseWithRequest;
    }

    private function generateNonce(): string
    {
        return md5(microtime(true) . uniqid('', true));
    }
}
