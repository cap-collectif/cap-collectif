<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\SiteParameter;
use PhpSpec\ObjectBehavior;

class SiteParameterSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(SiteParameter::class);
    }
}
