<?php

namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;

class SiteColorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\SiteColor');
    }
}
