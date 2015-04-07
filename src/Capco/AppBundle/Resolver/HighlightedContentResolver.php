<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Toggle\Manager;

class HighlightedContentResolver extends PositionableResolver
{
    public function __construct(HighlightedContentRepository $repository, Manager $toggleManager)
    {
        parent::__construct($repository, $toggleManager);
    }
}
