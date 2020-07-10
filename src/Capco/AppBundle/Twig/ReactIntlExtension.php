<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ReactIntlExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('intl_locale', [ReactIntlRuntime::class, 'getLocale']),
            new TwigFunction('intl_timeZone', [ReactIntlRuntime::class, 'getTimeZone']),
        ];
    }
}
