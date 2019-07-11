<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\HighlightedContentResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class HighlightedContentExtension extends AbstractExtension
{
    protected $resolver;

    public function __construct(HighlightedContentResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('capco_is_first_highlighted', [$this, 'isFirstHighlightedContent']),
            new TwigFilter('capco_is_last_highlighted', [$this, 'isLastHighlightedContent'])
        ];
    }

    public function isFirstHighlightedContent($content): bool
    {
        return $this->resolver->isFirst($content);
    }

    public function isLastHighlightedContent($content): bool
    {
        return $this->resolver->isLast($content);
    }
}
