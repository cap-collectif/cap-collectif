<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class BrowserLanguageExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_browser_language', [
                BrowserLanguageRuntime::class,
                'getBrowserLanguage',
            ]),
        ];
    }
}
