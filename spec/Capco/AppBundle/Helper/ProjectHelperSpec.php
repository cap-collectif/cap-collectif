<?php

namespace spec\Capco\AppBundle\Helper;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectRepository;

class ProjectHelperSpec extends ObjectBehavior
{
    function it_is_initializable(ProjectRepository $repo)
    {
        $this->beConstructedWith($repo);
        $this->shouldHaveType('Capco\AppBundle\Helper\ProjectHelper');
    }

    function it_can_find_previous_steps(ProjectRepository $repo, Project $project, AbstractStep $step, AbstractStep $stepA, AbstractStep $stepB)
    {
      $this->beConstructedWith($repo);
      $step->getProject()->willReturn($project);
      $step->getPosition()->willReturn(10);

      $repo->find($project)->willReturn($project);
      $project->getSteps()->willReturn([$step]);
      $this->getPreviousSteps($step)->shouldReturn([]);

      $stepA->getPosition()->willReturn(1);
      $stepB->getPosition()->willReturn(2);
      $project->getSteps()->willReturn([$stepA, $stepB, $step]);
      $this->getPreviousSteps($step)->shouldReturn([$stepA, $stepB]);

      $stepA->getPosition()->willReturn(1);
      $stepB->getPosition()->willReturn(20);
      $this->getPreviousSteps($step)->shouldReturn([$stepA]);

      $stepA->getPosition()->willReturn(15);
      $stepB->getPosition()->willReturn(20);
      $this->getPreviousSteps($step)->shouldReturn([]);
    }

}
