<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Reporting;
use PhpSpec\ObjectBehavior;

class ReportingSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Reporting::class);
    }
}
