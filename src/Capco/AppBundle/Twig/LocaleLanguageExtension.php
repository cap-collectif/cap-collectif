<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class LocaleLanguageExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('formatted_locales', [LocaleLanguageRuntime::class, 'getLocaleMap']),
        ];
    }
}
