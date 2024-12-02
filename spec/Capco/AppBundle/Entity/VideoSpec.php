<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Video;
use PhpSpec\ObjectBehavior;

class VideoSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Video::class);
    }
}
