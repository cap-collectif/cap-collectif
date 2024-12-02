<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\SiteColor;
use PhpSpec\ObjectBehavior;

class SiteColorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(SiteColor::class);
    }
}
