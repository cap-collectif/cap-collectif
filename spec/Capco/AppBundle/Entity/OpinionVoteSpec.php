<?php
namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Model\Publishable;

class OpinionVoteSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\OpinionVote');
    }

    function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }
}
