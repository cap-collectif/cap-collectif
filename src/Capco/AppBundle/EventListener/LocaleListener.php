<?php
namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

class LocaleListener
{
    protected $resolver;
    protected $availableLocales;

    public function __construct(Resolver $resolver, array $availableLocales)
    {
        $this->resolver = $resolver;
        $this->availableLocales = $availableLocales;
    }

    public function onKernelRequest(GetResponseEvent $event): void
    {
        if (
            $this->resolver->getValue('global.timezone') &&
            date_default_timezone_get() !== $this->resolver->getValue('global.timezone')
        ) {
            date_default_timezone_set($this->resolver->getValue('global.timezone'));
        }

        $request = $event->getRequest();
        
        if (!in_array($request->getLocale(), $this->availableLocales)) {
            // We set the user locale for symfony translations
            // If it doesn't match one available
            $locale = $this->resolver->getValue('global.locale');
            $request->setLocale($locale);
        }
    }
}
