<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Enum\DeleteAccountType;
use Symfony\Component\Routing\RouterInterface;

class BasicAuthLogoutHandler implements LogoutHandlerInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function handle(
        RedirectResponseWithRequest $responseWithRequest
    ): RedirectResponseWithRequest {
        $deleteType = $responseWithRequest->getRequest()->get('deleteType');
        $returnTo =
            DeleteAccountType::SOFT === $deleteType || DeleteAccountType::HARD === $deleteType
                ? $this->router->generate('app_homepage', ['deleteType' => $deleteType])
                : $responseWithRequest->getRequest()->headers->get('referer', '/');

        $responseWithRequest->getResponse()->setTargetUrl($returnTo);
        $responseWithRequest
            ->getRequest()
            ->getSession()
            ->invalidate();

        return $responseWithRequest;
    }
}
