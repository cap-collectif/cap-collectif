<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Resolver\HighlightedContentResolver;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;

class HighlightedContentController extends PositionableController
{
    public function __construct(BreadcrumbsBuilderInterface $breadcrumbsBuilder, Pool $pool)
    {
        parent::__construct(HighlightedContentResolver::class, $breadcrumbsBuilder, $pool);
    }
}
