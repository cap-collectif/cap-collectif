<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class RequestLocaleResolver extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('request_locale', [RequestLocaleRuntime::class, 'getRequestLocale']),
        ];
    }
}
