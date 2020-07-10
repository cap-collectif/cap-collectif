<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\LocaleResolver;
use Symfony\Component\HttpFoundation\Request;
use Twig\Extension\RuntimeExtensionInterface;

class RequestLocaleRuntime implements RuntimeExtensionInterface
{
    private $localeResolver;

    public function __construct(LocaleResolver $localeResolver)
    {
        $this->localeResolver = $localeResolver;
    }

    public function getRequestLocale(?Request $request = null): ?string
    {
        return $this->localeResolver->getDefaultLocaleCodeForRequest($request);
    }
}
