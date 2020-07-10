<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class StepsExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [new TwigFilter('capco_first_step_link', [StepsRuntime::class, 'getFirstStepLink'])];
    }
}
