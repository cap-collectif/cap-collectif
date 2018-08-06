<?php
namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Entity\Interfaces\Trashable;

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

    function it_is_a_trashable()
    {
        $this->shouldImplement(Trashable::class);
    }
}
