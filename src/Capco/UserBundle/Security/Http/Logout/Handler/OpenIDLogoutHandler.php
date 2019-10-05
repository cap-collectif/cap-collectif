<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\OpenID\OpenIDReferrerResolver;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;

class OpenIDLogoutHandler implements LogoutHandlerInterface
{
    private $toggleManager;
    private $resourceOwner;
    private $router;
    private $refererResolver;

    public function __construct(
        Manager $toggleManager,
        ResourceOwnerInterface $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver
    ) {
        $this->toggleManager = $toggleManager;
        $this->resourceOwner = $resourceOwner;
        $this->router = $router;
        $this->refererResolver = $referrerResolver;
    }

    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        if (
            $this->toggleManager->isActive('login_openid') &&
            $this->toggleManager->isActive('disconnect_openid') &&
            $responseWithRequest->getRequest()->query->get('ssoSwitchUser')
        ) {
            $logoutURL = $this->resourceOwner->getOption('logout_url');

            $homepageUrl = $this->router->generate(
                'app_homepage',
                [],
                RouterInterface::ABSOLUTE_URL
            );
            $redirectUri = $homepageUrl . '/login/openid?_destination=' . $homepageUrl;
            $referrerParameter = $this->refererResolver->getRefererParameterForLogout();

            $responseWithRequest->setResponse(
                new RedirectResponse(
                    $logoutURL . '?' . $referrerParameter . '=' . utf8_encode($redirectUri) ?? '/'
                )
            );
        }

        return $responseWithRequest;
    }
}
