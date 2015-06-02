<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\ConsultationStep;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class ConsultationStepSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\ConsultationStep');
    }

    function it_returns_correct_opening_status()
    {
        $before = (new \DateTime())->modify('-10 days');
        $after = (new \DateTime())->modify('+10 days');

        // Date de début antérieure
        $this->setStartAt($before);

        $this->setEndAt($before);
        $this->getOpeningStatus()->shouldReturn('closed');

        $this->setEndAt($after);
        $this->getOpeningStatus()->shouldReturn('open');

        $this->setEndAt(null);
        $this->getOpeningStatus()->shouldReturn('closed');

        // Date de début postérieure
        $this->setStartAt($after);

        $this->setEndAt($before);
        $this->getOpeningStatus()->shouldReturn(null);

        $this->setEndAt($after);
        $this->getOpeningStatus()->shouldReturn('future');

        $this->setEndAt(null);
        $this->getOpeningStatus()->shouldReturn('future');

        // Pas de date de début
        $this->setStartAt(null);

        $this->setEndAt($before);
        $this->getOpeningStatus()->shouldReturn('closed');

        $this->setEndAt($after);
        $this->getOpeningStatus()->shouldReturn('future');

        $this->setEndAt(null);
        $this->getOpeningStatus()->shouldReturn(null);
    }
}
