<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

class LocaleListener
{
    protected $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        // We set the user locale for symfony translations
        $locale = $this->resolver->getValue('global.locale');
        $request->setLocale($locale);
    }
}
