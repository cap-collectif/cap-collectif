<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class StatsExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [new TwigFunction('capco_has_stats', [StatsRuntime::class, 'hasStats'])];
    }
}
