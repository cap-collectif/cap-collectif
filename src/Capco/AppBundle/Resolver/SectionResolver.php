<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Repository\SectionRepository;
use Capco\AppBundle\Toggle\Manager;

class SectionResolver extends PositionableResolver
{
    public function __construct(SectionRepository $repository, Manager $toggleManager)
    {
        parent::__construct($repository, $toggleManager);
    }
}
