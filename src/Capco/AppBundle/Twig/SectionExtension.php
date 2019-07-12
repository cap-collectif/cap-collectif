<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\SectionResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class SectionExtension extends AbstractExtension
{
    protected $resolver;

    public function __construct(SectionResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('capco_is_first_section', [$this, 'isFirstSection']),
            new TwigFilter('capco_is_last_section', [$this, 'isLastSection'])
        ];
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
