<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\LocaleResolver;
use Symfony\Component\HttpFoundation\Request;
use Twig\Extension\RuntimeExtensionInterface;

class RequestLocaleRuntime implements RuntimeExtensionInterface
{
    public function __construct(
        private readonly LocaleResolver $localeResolver
    ) {
    }

    public function getRequestLocale(?Request $request = null): ?string
    {
        return $this->localeResolver->getDefaultLocaleCodeForRequest($request);
    }
}
