<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\HighlightedContentResolver;

class HighlightedContentExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(HighlightedContentResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFilters(): array
    {
        return [
            new \Twig_SimpleFilter('capco_is_first_highlighted', [$this, 'isFirstHighlightedContent']),
            new \Twig_SimpleFilter('capco_is_last_highlighted', [$this, 'isLastHighlightedContent']),
        ];
    }

    public function isFirstHighlightedContent($content)
    {
        return $this->resolver->isFirst($content);
    }

    public function isLastHighlightedContent($content)
    {
        return $this->resolver->isLast($content);
    }
}
