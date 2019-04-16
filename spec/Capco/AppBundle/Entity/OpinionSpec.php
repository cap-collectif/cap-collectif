<?php

namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Entity\Interfaces\Trashable;

class OpinionSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Opinion');
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }

    public function it_is_a_trashable()
    {
        $this->shouldImplement(Trashable::class);
    }

    public function it_clean_new_lines_from_bodyText()
    {
        $testString = '<p>Magni voluptates
harum modi tempore quis numquam.</p>';
        $this->setBody($testString);
        $this->getBodyText()->shouldReturn('Magni voluptates harum modi tempore quis numquam.');
    }
}
