<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Resolver\HighlightedContentResolver;

class HighlightedContentController extends PositionableController
{
    public function __construct()
    {
        parent::__construct(HighlightedContentResolver::class);
    }
}
