<?php

declare(strict_types=1);

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LocaleCookieSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly Manager $toggleManager,
        private readonly LocaleRepository $localeRepository
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        if (!$this->toggleManager->isActive(Manager::multilangue)) {
            return;
        }

        $request = $event->getRequest();
        $resolvedLocale = $this->localeRepository->getValidCode($request->getLocale() ?: null);

        if ('' === $resolvedLocale) {
            return;
        }

        $currentLocaleCookie = $request->cookies->get('locale');
        if ($currentLocaleCookie === $resolvedLocale) {
            return;
        }

        $event->getResponse()->headers->setCookie(
            Cookie::create(
                name: 'locale',
                value: $resolvedLocale,
                expire: new \DateTimeImmutable('+13 months'),
                path: '/',
                secure: $request->isSecure(),
                httpOnly: false,
                sameSite: Cookie::SAMESITE_STRICT
            )
        );
    }
}
