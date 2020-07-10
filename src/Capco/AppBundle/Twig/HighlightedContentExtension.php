<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class HighlightedContentExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('capco_is_first_highlighted', [
                HighlightedContentRuntime::class,
                'isFirstHighlightedContent',
            ]),
            new TwigFilter('capco_is_last_highlighted', [
                HighlightedContentRuntime::class,
                'isLastHighlightedContent',
            ]),
        ];
    }
}
