<?php

namespace Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Enum\DeleteAccountType;
use Symfony\Component\Routing\RouterInterface;

class BasicAuthLogoutHandler implements LogoutHandlerInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    public function handle(
        RedirectResponseWithRequestInterface $responseWithRequest
    ): RedirectResponseWithRequestInterface {
        $deleteType = $responseWithRequest->getRequest()->get('deleteType');
        if ($deleteType) {
            $returnTo =
                DeleteAccountType::SOFT === $deleteType || DeleteAccountType::HARD === $deleteType
                    ? $this->router->generate('app_homepage', ['deleteType' => $deleteType])
                    : $responseWithRequest->getRequest()->headers->get('referer', '/');

            $responseWithRequest->getResponse()->setTargetUrl($returnTo);
            $responseWithRequest
                ->getRequest()
                ->getSession()
                ->invalidate()
            ;
        }

        return $responseWithRequest;
    }
}
