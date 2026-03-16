<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class FranceConnectLogoutHandler implements LogoutHandlerInterface
{
    public const SESSION_LOGOUT_REQUIRED_KEY = 'franceconnect_logout_required';
    public const SESSION_IMMEDIATE_LOGOUT_REQUIRED_KEY = 'franceconnect_immediate_logout_required';
    public const SESSION_ID_TOKEN_KEY = 'franceconnect_id_token';
    public const SESSION_POST_LOGOUT_REDIRECT_URL_KEY = 'franceconnect_post_logout_redirect_url';
    public const SESSION_AFTER_LOGOUT_REDIRECT_URL_KEY = 'franceconnect_after_logout_redirect_url';

    public function __construct(
        private readonly Manager $toggleManager,
        private readonly ResourceOwnerInterface $resourceOwner,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly RouterInterface $router
    ) {
    }

    public function handle(
        RedirectResponseWithRequestInterface $responseWithRequest
    ): RedirectResponseWithRequestInterface {
        $request = $responseWithRequest->getRequest();
        $token = $this->tokenStorage->getToken();

        if (
            $this->shouldLogoutFromFranceConnect($request, $token)
            && $this->toggleManager->isActive('login_franceconnect')
        ) {
            $logoutURL = $this->getLogoutUrl(
                null,
                null,
                $request
            );

            self::clearFranceConnectSession($request);
            $responseWithRequest->setResponse(new RedirectResponse($logoutURL));
        }

        return $responseWithRequest;
    }

    public function getLogoutUrl(?User $user = null, ?string $postLogoutRedirectUrl = null, ?Request $request = null): string
    {
        $logoutURL = $this->resourceOwner->getOption('logout_url');
        $redirectUrl = $postLogoutRedirectUrl ?? $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL);
        $idToken = $this->getIdToken($user, $request);
        $parameters = [
            'post_logout_redirect_uri' => $redirectUrl,
            'state' => $this->generateNonce(),
        ];
        if ('' !== $idToken) {
            $parameters['id_token_hint'] = $idToken;
        }

        return $logoutURL . '?' . http_build_query($parameters, '', '&') ?? '/';
    }

    public static function storeFranceConnectSession(Request $request, string $idToken, ?string $postLogoutRedirectUrl = null): void
    {
        if (!$request->hasSession()) {
            return;
        }

        $session = $request->getSession();
        $session->set(self::SESSION_LOGOUT_REQUIRED_KEY, true);
        $session->set(self::SESSION_ID_TOKEN_KEY, $idToken);
        if (null !== $postLogoutRedirectUrl) {
            $session->set(self::SESSION_POST_LOGOUT_REDIRECT_URL_KEY, $postLogoutRedirectUrl);
        }
    }

    public static function storeImmediateFranceConnectSession(Request $request, string $idToken, ?string $postLogoutRedirectUrl = null): void
    {
        if (!$request->hasSession()) {
            return;
        }

        self::storeFranceConnectSession($request, $idToken, $postLogoutRedirectUrl);
        $request->getSession()->set(self::SESSION_IMMEDIATE_LOGOUT_REQUIRED_KEY, true);
    }

    public static function storeAfterLogoutRedirectUrl(Request $request, string $redirectUrl): void
    {
        if (!$request->hasSession()) {
            return;
        }

        $request->getSession()->set(self::SESSION_AFTER_LOGOUT_REDIRECT_URL_KEY, $redirectUrl);
    }

    public static function consumeAfterLogoutRedirectUrl(Request $request): ?string
    {
        if (!$request->hasSession()) {
            return null;
        }

        $session = $request->getSession();
        $redirectUrl = $session->get(self::SESSION_AFTER_LOGOUT_REDIRECT_URL_KEY);
        $session->remove(self::SESSION_AFTER_LOGOUT_REDIRECT_URL_KEY);

        return \is_string($redirectUrl) && '' !== $redirectUrl ? $redirectUrl : null;
    }

    public static function clearFranceConnectSession(Request $request): void
    {
        if (!$request->hasSession()) {
            return;
        }

        $session = $request->getSession();
        $session->remove(self::SESSION_LOGOUT_REQUIRED_KEY);
        $session->remove(self::SESSION_IMMEDIATE_LOGOUT_REQUIRED_KEY);
        $session->remove(self::SESSION_ID_TOKEN_KEY);
        $session->remove(self::SESSION_POST_LOGOUT_REDIRECT_URL_KEY);
    }

    private function generateNonce(): string
    {
        return md5(microtime(true) . uniqid('', true));
    }

    private function shouldLogoutFromFranceConnect(Request $request, mixed $token): bool
    {
        // This check prevents redirecting to FranceConnect logout when the user
        // authenticated only with another workflow (classic auth, Facebook, etc.).
        // We trigger logout only if the current token is a FranceConnect token or if
        // the session explicitly remembers that a FranceConnect session was opened.
        if (
            $request->hasSession()
            && (bool) $request->getSession()->get(self::SESSION_LOGOUT_REQUIRED_KEY, false)
        ) {
            return true;
        }

        return $token instanceof OAuthToken && 'franceconnect' === $token->getResourceOwnerName();
    }

    private function getIdToken(?User $user = null, ?Request $request = null): string
    {
        if ($user && $user->getFranceConnectIdToken()) {
            return $user->getFranceConnectIdToken();
        }

        $token = $this->tokenStorage->getToken();
        if ($token instanceof OAuthToken) {
            return $token->getRawToken()['id_token'] ?? '';
        }

        if ($request) {
            if ($request->hasSession()) {
                return (string) $request->getSession()->get(self::SESSION_ID_TOKEN_KEY, '');
            }
        }

        return '';
    }
}
