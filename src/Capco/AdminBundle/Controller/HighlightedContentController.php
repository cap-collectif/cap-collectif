<?php

namespace Capco\AdminBundle\Controller;

class HighlightedContentController extends PositionableController
{
    public function __construct()
    {
        parent::__construct('Capco\AppBundle\Resolver\HighlightedContentResolver');
    }
}
