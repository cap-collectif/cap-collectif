<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class SectionExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('capco_is_first_section', [SectionRuntime::class, 'isFirstSection']),
            new TwigFilter('capco_is_last_section', [SectionRuntime::class, 'isLastSection']),
        ];
    }
}
