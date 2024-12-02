<?php

namespace Capco\AppBundle\Cache;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Custom listener to control Cache-Control headers when a session is active.
 */
class SessionListener implements EventSubscriberInterface
{
    private const NO_AUTO_CACHE_CONTROL_HEADER = 'X-No-Auto-Cache-Control';

    public function __construct(private readonly SessionInterface $session)
    {
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMasterRequest()) {
            return;
        }

        $response = $event->getResponse();
        $response->headers->remove(self::NO_AUTO_CACHE_CONTROL_HEADER);

        if (!$this->session->isStarted()) {
            return;
        }

        $this->session->save();
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }
}
