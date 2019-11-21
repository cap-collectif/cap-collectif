<?php

namespace Capco\AppBundle\Twig;

use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;

class ReactIntlExtension extends AbstractExtension
{
    private $resolver;
    private $requestStack;

    public function __construct(SiteParameterResolver $resolver, RequestStack $requestStack)
    {
        $this->resolver = $resolver;
        $this->requestStack = $requestStack;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('intl_locale', [$this, 'getLocale']),
            new TwigFunction('intl_timeZone', [$this, 'getTimeZone'])
        ];
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
