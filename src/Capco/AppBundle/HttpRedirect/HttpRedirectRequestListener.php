<?php

namespace Capco\AppBundle\HttpRedirect;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class HttpRedirectRequestListener
{
    public function __construct(
        private readonly Manager $toggleManager,
        private readonly HttpRedirectResolver $httpRedirectResolver
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        if ($this->toggleManager->isActive('http_redirects')) {
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
