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

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_section_resolver';
    }

    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('capco_is_first_section', array($this, 'isFirstSection')),
            new \Twig_SimpleFilter('capco_is_last_section', array($this, 'isLastSection')),
        );
    }

    public function isFirstSection($section)
    {
        return $this->resolver->isFirstSection($section);
    }

    public function isLastSection($section)
    {
        return $this->resolver->isLastSection($section);
    }
}
