<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SSOExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [new TwigFunction('sso_list', [SSORuntime::class, 'getSSOList'])];
    }
}
