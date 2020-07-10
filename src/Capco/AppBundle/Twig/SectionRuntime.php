<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\SectionResolver;
use Twig\Extension\RuntimeExtensionInterface;

class SectionRuntime implements RuntimeExtensionInterface
{
    protected $resolver;

    public function __construct(SectionResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function isFirstSection($section): bool
    {
        return $this->resolver->isFirst($section);
    }

    public function isLastSection($section): bool
    {
        return $this->resolver->isLast($section);
    }
}
