<?php

namespace Capco\AppBundle\HttpRedirect;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class HttpRedirectRequestListener
{
    public function __construct(
        private readonly HttpRedirectResolver $httpRedirectResolver
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $redirect = $this->httpRedirectResolver->resolve($event->getRequest());
        if (null === $redirect) {
            return;
        }

        $event->setResponse(new RedirectResponse(
            $redirect->getDestinationUrl(),
            $redirect->getStatusCode()
        ));
    }
}
