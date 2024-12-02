<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Post;
use PhpSpec\ObjectBehavior;

class PostSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Post::class);
    }
}
