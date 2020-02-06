<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\LocaleResolver;
use Symfony\Component\HttpFoundation\Request;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class RequestLocaleResolver extends AbstractExtension
{
    private $localeResolver;

    public function __construct(LocaleResolver $localeResolver)
    {
        $this->localeResolver = $localeResolver;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('request_locale', [$this, 'getRequestLocale']),
        ];
    }

    public function getRequestLocale(?Request $request = null): ?string
    {
        return $this->localeResolver->getDefaultLocaleCodeForRequest($request);
    }
}
