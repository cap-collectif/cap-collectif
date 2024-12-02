<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\SiteImage;
use PhpSpec\ObjectBehavior;

class SiteImageSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(SiteImage::class);
    }
}
