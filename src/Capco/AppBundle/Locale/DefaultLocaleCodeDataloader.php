<?php

namespace Capco\AppBundle\Locale;

use Capco\AppBundle\Resolver\LocaleResolver;

class DefaultLocaleCodeDataloader
{
    private $defaultLocale;
    private $localeResolver;

    public function __construct(LocaleResolver $localeResolver)
    {
        $this->localeResolver = $localeResolver;
    }

    public function __invoke(): string
    {
        if (!$this->defaultLocale) {
            $this->defaultLocale = $this->localeResolver->getDefaultLocaleCode();
        }

        return $this->defaultLocale;
    }
}
