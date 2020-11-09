<?php

namespace spec\Capco\AppBundle\Entity\Debate;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Steps\DebateStep;

class DebateSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Debate::class);
    }

    public function it_can_participate_when_open(DebateStep $step, Project $project)
    {
        $step->canContribute(null)->willReturn(true);
        $project->viewerCanSee(null)->willReturn(true);
        $step->getProject()->willReturn($project);

        $this->setStep($step);
        $this->viewerCanParticipate(null)->shouldBe(true);
    }

    public function it_can_not_participate_when_closed(DebateStep $step, Project $project)
    {
        $step->canContribute(null)->willReturn(false);
        $project->viewerCanSee(null)->willReturn(true);
        $step->getProject()->willReturn($project);

        $this->setStep($step);
        $this->viewerCanParticipate(null)->shouldBe(false);
    }

    public function it_can_not_participate_if_no_access(DebateStep $step, Project $project)
    {
        $project->viewerCanSee(null)->willReturn(false);
        $step->getProject()->willReturn($project);

        $this->setStep($step);
        $this->viewerCanParticipate(null)->shouldBe(false);
    }
}
