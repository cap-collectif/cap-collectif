<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\FooterSocialNetwork;
use PhpSpec\ObjectBehavior;

class FooterSocialNetworkSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(FooterSocialNetwork::class);
    }
}
