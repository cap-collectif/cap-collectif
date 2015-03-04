<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class EventCommentSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\EventComment');
    }
}
