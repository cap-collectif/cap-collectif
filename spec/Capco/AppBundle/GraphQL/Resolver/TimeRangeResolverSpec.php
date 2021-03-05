<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\GraphQL\Resolver\TimeRangeResolver;
use PhpSpec\ObjectBehavior;

class TimeRangeResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(TimeRangeResolver::class);
    }

    public function it_returns_fields_with_good_typing(QuestionnaireStep $step)
    {
        $step->getStartAt()->willReturn(null);
        $step->getEndAt()->willReturn(null);
        $step->hasStarted()->willReturn(false);
        $step->hasEnded()->willReturn(false);
        $step->getRemainingTime()->willReturn(null);
        $step->lastOneDay()->willReturn(false);
        $step->isOpen()->willReturn(false);
        $step->isClosed()->willReturn(false);
        $step->isFuture()->willReturn(false);
        $step->isTimeless()->willReturn(false);

        $this->__invoke($step)->shouldReturn([
            'startAt' => null,
            'endAt' => null,
            'hasStarted' => false,
            'hasEnded' => false,
            'remainingTime' => null,
            'lastOneDay' => false,
            'isOpen' => false,
            'isClosed' => false,
            'isFuture' => false,
            'isTimeless' => false,
        ]);

        $start = new \DateTime('now');
        $end = new \DateTime('now + 2 days');
        $step->getStartAt()->willReturn($start);
        $step->getEndAt()->willReturn($end);
        $step->getRemainingTime()->willReturn(['days' => 2, 'hours' => 1]);
        $step->hasStarted()->willReturn(true);
        $step->hasEnded()->willReturn(true);
        $step->lastOneDay()->willReturn(true);
        $step->isOpen()->willReturn(true);
        $step->isClosed()->willReturn(true);
        $step->isFuture()->willReturn(true);
        $step->isTimeless()->willReturn(true);

        $this->__invoke($step)->shouldReturn([
            'startAt' => $start,
            'endAt' => $end,
            'hasStarted' => true,
            'hasEnded' => true,
            'remainingTime' => ['days' => 2, 'hours' => 1],
            'lastOneDay' => true,
            'isOpen' => true,
            'isClosed' => true,
            'isFuture' => true,
            'isTimeless' => true,
        ]);
    }
}
