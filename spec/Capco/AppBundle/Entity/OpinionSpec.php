<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Model\Publishable;
use PhpSpec\ObjectBehavior;

class OpinionSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Opinion::class);
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

    public function it_bodyText_handle_null_value()
    {
        $this->setBody(null);
        $this->getBodyText()->shouldReturn('');
    }
}
