<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class FranceConnectLogoutSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly FranceConnectLogoutHandler $franceConnectLogoutHandler,
        private readonly Manager $toggleManager
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'kernel.request' => 'onKernelRequest',
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if (
            !$event->isMainRequest()
            || !$request->isMethod('GET')
            || !$request->hasSession()
            || !$this->toggleManager->isActive('login_franceconnect')
            || '/profile/franceconnect/association-return' === $request->getPathInfo()
        ) {
            return;
        }

        if (!(bool) $request->getSession()->get(FranceConnectLogoutHandler::SESSION_IMMEDIATE_LOGOUT_REQUIRED_KEY, false)) {
            return;
        }

        $postLogoutRedirectUrl = $request->getSession()->get(
            FranceConnectLogoutHandler::SESSION_POST_LOGOUT_REDIRECT_URL_KEY
        );
        if (!\is_string($postLogoutRedirectUrl) || '' === $postLogoutRedirectUrl) {
            return;
        }

        $logoutUrl = $this->franceConnectLogoutHandler->getLogoutUrl(
            null,
            $postLogoutRedirectUrl,
            $request
        );

        FranceConnectLogoutHandler::clearFranceConnectSession($request);

        $event->setResponse(new RedirectResponse($logoutUrl));
    }
}
