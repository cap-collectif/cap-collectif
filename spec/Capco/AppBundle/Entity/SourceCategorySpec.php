<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\SourceCategory;
use PhpSpec\ObjectBehavior;

class SourceCategorySpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(SourceCategory::class);
    }
}
