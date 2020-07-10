<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\RuntimeExtensionInterface;

class ReactIntlRuntime implements RuntimeExtensionInterface
{
    private $resolver;
    private $requestStack;

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
        return $this->resolver->getValue('global.timezone');
    }
}
