<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Manager\ResponseMediaManager;
use Doctrine\Orm\EntityManager;
use PhpSpec\ObjectBehavior;

class ResponseMediaManagerSpec extends ObjectBehavior
{
    function let(EntityManager $em, MediaManager $mediaManager)
    {
        $this->beConstructedWith($em, $mediaManager);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(ResponseMediaManager::class);
    }
}
