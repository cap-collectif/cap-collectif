<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\RuntimeExtensionInterface;

class ReactIntlRuntime implements RuntimeExtensionInterface
{
    private readonly SiteParameterResolver $resolver;
    private readonly RequestStack $requestStack;

    public function __construct(SiteParameterResolver $resolver, RequestStack $requestStack)
    {
        $this->resolver = $resolver;
        $this->requestStack = $requestStack;
    }

    public function getLocale(): string
    {
        $request = $this->requestStack->getMasterRequest();

        return $request->getLocale();
    }

    public function getTimeZone(): string
    {
        // by default the time zone id Europe/Paris, but if we change it can be America/Toronto (GMT-05:00)
        // so we picked the first part
        $timeZone = $this->resolver->getValue('global.timezone');

        return explode(' ', (string) $timeZone)[0];
    }
}
