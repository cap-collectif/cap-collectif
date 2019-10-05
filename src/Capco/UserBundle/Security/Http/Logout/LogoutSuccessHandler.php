<?php

namespace Capco\UserBundle\Security\Http\Logout;

use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use Capco\UserBundle\OpenID\OpenIDReferrerResolver;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use SimpleSAML\Auth\Simple;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;

class LogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    protected $tokenStorage;
    protected $samlAuth;
    protected $router;
    protected $toggleManager;
    protected $client;
    protected $franceConnectResourceOwner;
    protected $openIDResourceOwner;
    protected $referrerResolver;

    public function __construct(
        TokenStorageInterface $tokenStorage,
        RouterInterface $router,
        Manager $toggleManager,
        OpenAmClient $client,
        ResourceOwnerInterface $openIDResourceOwner,
        ResourceOwnerInterface $franceConnectResourceOwner,
        OpenIDReferrerResolver $referrerResolver,
        ?Simple $samlAuth = null
    ) {
        $this->tokenStorage = $tokenStorage;
        $this->samlAuth = $samlAuth;
        $this->router = $router;
        $this->toggleManager = $toggleManager;
        $this->client = $client;
        $this->franceConnectResourceOwner = $franceConnectResourceOwner;
        $this->openIDResourceOwner = $openIDResourceOwner;
        $this->referrerResolver = $referrerResolver;
    }

    public function onLogoutSuccess(Request $request)
    {
        $token = $this->tokenStorage->getToken();

        $deleteType = $request->get('deleteType');
        $returnTo =
            DeleteAccountType::SOFT === $deleteType || DeleteAccountType::HARD === $deleteType
                ? $this->router->generate('app_homepage', ['deleteType' => $deleteType])
                : $request->headers->get('referer', '/');

        $request->getSession()->invalidate();

        if ($this->toggleManager->isActive('login_saml')) {
            $this->samlAuth->logout($returnTo);
        }

        $response = new RedirectResponse($returnTo);

        $response = $this->handleParisLogout($request, $response);
        $response = $this->handleOpenIDLogout($request, $response);

        return $this->handleFranceConnectLogout($response, $token);
    }

    private function handleParisLogout(
        Request $request,
        RedirectResponse $response
    ): RedirectResponse {
        if (
            $this->toggleManager->isActive('login_paris') &&
            $request->cookies->has(OpenAmClient::COOKIE_NAME)
        ) {
            $this->client->setCookie($request->cookies->get(OpenAmClient::COOKIE_NAME));
            $this->client->logoutUser();
            $response->headers->clearCookie(
                OpenAmClient::COOKIE_NAME,
                '/',
                OpenAmClient::COOKIE_DOMAIN
            );
        }

        return $response;
    }

    private function handleOpenIDLogout(
        Request $request,
        RedirectResponse $response
    ): RedirectResponse {
        if (
            $this->toggleManager->isActive('login_openid') &&
            $this->toggleManager->isActive('disconnect_openid') &&
            $request->query->get('ssoSwitchUser')
        ) {
            $logoutURL = $this->openIDResourceOwner->getOption('logout_url');

            $homepageUrl = $this->router->generate(
                'app_homepage',
                [],
                RouterInterface::ABSOLUTE_URL
            );
            $redirectUri = $homepageUrl . '/login/openid?_destination=' . $homepageUrl;
            $referrerParameter = $this->referrerResolver->getRefererParameterForLogout();

            return new RedirectResponse(
                $logoutURL . '?' . $referrerParameter . '=' . utf8_encode($redirectUri) ?? '/'
            );
        }

        return $response;
    }

    private function handleFranceConnectLogout(
        RedirectResponse $response,
        ?TokenInterface $token = null
    ): RedirectResponse {
        if (
            $token &&
            $token instanceof OAuthToken &&
            $this->toggleManager->isActive('login_franceconnect')
        ) {
            $logoutURL = $this->franceConnectResourceOwner->getOption('logout_url');

            $homepageUrl = $this->router->generate(
                'app_homepage',
                [],
                RouterInterface::ABSOLUTE_URL
            );

            // Uncomment it if yo want to test France Connect in localhost.
            // $homepageUrl = 'http://localhost:4242/logout';

            $parameters = [
                'post_logout_redirect_uri' => $homepageUrl,
                'state' => $this->generateNonce(),
                'id_token_hint' => $token->getRawToken()['id_token']
            ];

            return new RedirectResponse(
                $logoutURL . '?' . http_build_query($parameters, '', '&') ?? '/'
            );
        }

        return $response;
    }

    private function generateNonce(): string
    {
        return md5(microtime(true) . uniqid('', true));
    }
}
