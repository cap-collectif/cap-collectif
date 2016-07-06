<?php

namespace spec\Capco\AppBundle\Helper;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\AbstractStepRepository;

class ProjectHelperSpec extends ObjectBehavior
{
    function it_is_initializable(ProjectRepository $projectRepo, AbstractStepRepository $stepRepo)
    {
        $this->beConstructedWith($projectRepo, $stepRepo);
        $this->shouldHaveType('Capco\AppBundle\Helper\ProjectHelper');
    }

    function it_can_find_previous_steps(ProjectRepository $projectRepo, AbstractStepRepository $stepRepo, Project $project, AbstractStep $step, AbstractStep $stepA, AbstractStep $stepB)
    {
      $this->beConstructedWith($projectRepo, $stepRepo);

      $project->getSlug()->willReturn('project-1');
      $step->getProject()->willReturn($project);
      $step->getPosition()->willReturn(10);

      $stepRepo->getByProjectSlug('project-1')->willReturn([$step]);
      $this->getPreviousSteps($step)->shouldReturn([]);

      $stepA->getPosition()->willReturn(1);
      $stepB->getPosition()->willReturn(2);
      $stepRepo->getByProjectSlug('project-1')->willReturn([$stepA, $stepB, $step]);
      $this->getPreviousSteps($step)->shouldReturn([$stepA, $stepB]);

      $stepA->getPosition()->willReturn(1);
      $stepB->getPosition()->willReturn(20);
      $this->getPreviousSteps($step)->shouldReturn([$stepA]);

      $stepA->getPosition()->willReturn(15);
      $stepB->getPosition()->willReturn(20);
      $this->getPreviousSteps($step)->shouldReturn([]);
    }

}
