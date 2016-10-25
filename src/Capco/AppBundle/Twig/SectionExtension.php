<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\SectionResolver;

class SectionExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(SectionResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFilters(): array
    {
        return [
            new \Twig_SimpleFilter('capco_is_first_section', [$this, 'isFirstSection']),
            new \Twig_SimpleFilter('capco_is_last_section', [$this, 'isLastSection']),
        ];
    }

    public function isFirstSection($section)
    {
        return $this->resolver->isFirst($section);
    }

    public function isLastSection($section)
    {
        return $this->resolver->isLast($section);
    }
}
