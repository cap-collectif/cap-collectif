<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class DefaultLanguageExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('capco_default_locale_code', [
                DefaultLanguageRuntime::class,
                'getDefaultLocale',
            ]),
        ];
    }
}
