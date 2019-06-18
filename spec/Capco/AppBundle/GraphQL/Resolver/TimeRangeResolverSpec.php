<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\GraphQL\Resolver\TimeRangeResolver;
use PhpSpec\ObjectBehavior;

class TimeRangeResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(TimeRangeResolver::class);
    }

    public function it_returns_null_if_time_range_is_empty(QuestionnaireStep $step): void
    {
        $step->getStartAt()->willReturn(null);
        $step->getEndAt()->willReturn(null);
        $this->__invoke($step)->shouldReturn(null);
    }

    public function it_returns_a_time_range_if_dates_are_not_null(Event $event): void
    {
        $startAt = new \DateTime('now');
        $endAt = new \DateTime('now + 2 days');
        $event->getStartAt()->willReturn($startAt);
        $event->getEndAt()->willReturn($endAt);
        $this->__invoke($event)->shouldReturn([
            'startAt' => $startAt,
            'endAt' => $endAt
        ]);

        $endAt = null;
        $event->getEndAt()->willReturn($endAt);
        $this->__invoke($event)->shouldReturn([
            'startAt' => $startAt,
            'endAt' => null
        ]);

        $endAt = new \DateTime('now + 2 days');
        $startAt = null;
        $event->getStartAt()->willReturn($startAt);
        $event->getEndAt()->willReturn($endAt);
        $this->__invoke($event)->shouldReturn([
            'startAt' => null,
            'endAt' => $endAt
        ]);
    }
}
