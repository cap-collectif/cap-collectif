<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Resolver\HighlightedContentResolver;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;

class HighlightedContentController extends PositionableController
{
    private HighlightedContentResolver $resolver;

    public function __construct(BreadcrumbsBuilderInterface $breadcrumbsBuilder, Pool $pool, HighlightedContentResolver $resolver)
    {
        parent::__construct(HighlightedContentResolver::class, $breadcrumbsBuilder, $pool);
        $this->resolver = $resolver;
    }

    protected function move($object, $relativePosition, $resolver = null)
    {
        parent::move($object, $relativePosition, $this->resolver);
    }
}
