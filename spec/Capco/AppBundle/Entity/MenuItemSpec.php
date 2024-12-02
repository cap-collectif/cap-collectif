<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\MenuItem;
use PhpSpec\ObjectBehavior;

class MenuItemSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(MenuItem::class);
    }
}
