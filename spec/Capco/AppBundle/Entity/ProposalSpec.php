<?php
namespace spec\Capco\AppBundle\Entity;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Model\Publishable;

class ProposalSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(Proposal::class);
    }

    function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
