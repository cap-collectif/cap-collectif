<?php

namespace Capco\AppBundle\Locale;

use Capco\AppBundle\Resolver\LocaleResolver;

class DefaultLocaleCodeDataloader
{
    private $defaultLocale;

    public function __construct(private readonly LocaleResolver $localeResolver)
    {
    }

    public function __invoke(): string
    {
        if (!$this->defaultLocale) {
            $this->defaultLocale = $this->localeResolver->getDefaultLocaleCode();
        }

        return $this->defaultLocale;
    }
}
