<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\SocialNetwork;
use PhpSpec\ObjectBehavior;

class SocialNetworkSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(SocialNetwork::class);
    }
}
