<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Resolver\RequestLocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\FormatDateTrait;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LocaleSubscriber implements EventSubscriberInterface
{
    use FormatDateTrait;

    public function __construct(
        private readonly SiteParameterResolver $siteParameters,
        private readonly Manager $toggleManager,
        private readonly RequestLocaleResolver $requestLocaleResolver
    ) {
    }

    public function onKernelRequest(RequestEvent $event)
    {
        $timeZone = $this->siteParameters->getValue('global.timezone');
        if ($timeZone && date_default_timezone_get() !== $timeZone) {
            date_default_timezone_set(static::clearTimeZone($timeZone));
        }

        $request = $event->getRequest();

        $resolvedLocale = $this->requestLocaleResolver->resolve($request);
        $request->setLocale($resolvedLocale);
        $request->attributes->set('_locale', $resolvedLocale);
        $this->persistLocale($request, $resolvedLocale);
    }

    public static function getSubscribedEvents()
    {
        return [
            // must be registered before (i.e. with a higher priority than) the default Locale listener
            KernelEvents::REQUEST => [['onKernelRequest', 15]],
        ];
    }

    private function persistLocale(Request $request, string $locale): void
    {
        if (!$this->toggleManager->isActive(Manager::multilangue)) {
            return;
        }

        if (!$request->hasSession()) {
            return;
        }

        $session = $request->getSession();
        if ($session->get('_locale') !== $locale) {
            $session->set('_locale', $locale);
        }
    }
}
