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
            new \Twig_SimpleFilter('capco_is_first_section', array($this, 'isFirstHighlightedContent')),
            new \Twig_SimpleFilter('capco_is_last_section', array($this, 'isLastHighlightedContent')),
        );
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
