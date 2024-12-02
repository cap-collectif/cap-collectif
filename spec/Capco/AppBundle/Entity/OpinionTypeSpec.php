<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\OpinionType;
use PhpSpec\ObjectBehavior;

class OpinionTypeSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(OpinionType::class);
    }
}
