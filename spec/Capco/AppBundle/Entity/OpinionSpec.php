<?php
namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Model\Publishable;

class OpinionSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Opinion');
    }

    function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }

    function it_can_be_unstrashed()
    {
        $this->setIsTrashed(false);

        $this->getIsTrashed()->shouldReturn(false);
        $this->getTrashedReason()->shouldReturn(null);
        $this->getTrashedAt()->shouldReturn(null);
    }
}
