<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\HighlightedContentResolver;
use Twig\Extension\RuntimeExtensionInterface;

class HighlightedContentRuntime implements RuntimeExtensionInterface
{
    protected $resolver;

    public function __construct(HighlightedContentResolver $resolver)
    {
        $this->resolver = $resolver;
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
