<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\SiteParameter\Resolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class LocaleSubscriber implements EventSubscriberInterface
{
    protected $siteParameters;
    protected $availableLocales;
    protected $toggleManager;

    public function __construct(
        Resolver $siteParameters,
        array $availableLocales,
        Manager $toggleManager
    ) {
        $this->siteParameters = $siteParameters;
        $this->availableLocales = $availableLocales;
        $this->toggleManager = $toggleManager;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $timeZone = $this->siteParameters->getValue('global.timezone');
        if ($timeZone && date_default_timezone_get() !== $timeZone) {
            date_default_timezone_set($timeZone);
        }

        // Website locale configured by administrator
        $defaultLocale = $this->siteParameters->getValue('global.locale');

        $request = $event->getRequest();

        if (!$this->toggleManager->isActive('unstable__multilangue')) {
            $request->setLocale($defaultLocale);

            return;
        }

        if (!$request->hasPreviousSession()) {
            // Here we force locale for anonymous users
            // TODO remove me once we have a locale switcher
            // using cookies https://github.com/cap-collectif/platform/issues/9151
            $request->setLocale($defaultLocale);

            return;
        }

        // We set the user locale for symfony translations
        // If it doesn't match one available
        if (!\in_array($request->getLocale(), $this->availableLocales)) {
            $request->setLocale($defaultLocale);
        }
    }

    public static function getSubscribedEvents()
    {
        return [
            // must be registered before (i.e. with a higher priority than) the default Locale listener
            KernelEvents::REQUEST => [['onKernelRequest', 15]]
        ];
    }
}
