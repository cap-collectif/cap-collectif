<?php

namespace Capco\AppBundle\EventListener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class NextPublicAppFallbackListener
{
    public function onKernelException(ExceptionEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        if (!$event->getThrowable() instanceof NotFoundHttpException) {
            return;
        }

        if ($event->getRequest()->attributes->has('_route')) {
            return;
        }

        $event->setResponse(new Response('', Response::HTTP_I_AM_A_TEAPOT));
    }
}
