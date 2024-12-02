<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Page;
use PhpSpec\ObjectBehavior;

class PageSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Page::class);
    }
}
