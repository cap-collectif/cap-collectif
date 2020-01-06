<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireExportResultsUrlResolver;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Routing\RouterInterface;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Project;

class QuestionnaireExportResultsUrlResolverSpec extends ObjectBehavior
{
    public function let(RouterInterface $router)
    {
        $this->beConstructedWith('<EXPORT_DIR>', $router);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(QuestionnaireExportResultsUrlResolver::class);
    }

    public function it_resolve_fileName_when_no_step(Questionnaire $questionnaire)
    {
        $questionnaire->getSlug()->willReturn('my-slug');
        $questionnaire->getStep()->willReturn(null);
        $this->getFileName($questionnaire)->shouldReturn('my-slug.xlsx');
    }

    public function it_resolve_fileName_inside_a_step_but_no_project(
        Questionnaire $questionnaire,
        QuestionnaireStep $step
    ) {
        $questionnaire->getStep()->willReturn($step);
        $step->getProject()->willReturn(null);
        $step->getSlug()->willReturn('step-slug');
        $this->getFileName($questionnaire)->shouldReturn('step-slug.xlsx');
    }

    public function it_resolve_fileName_inside_a_project(
        Questionnaire $questionnaire,
        QuestionnaireStep $step,
        Project $project
    ) {
        $questionnaire->getStep()->willReturn($step);
        $step->getSlug()->willReturn('step-slug');
        $step->getProject()->willReturn($project);
        $project->getSlug()->willReturn('project-slug');

        $this->getFileName($questionnaire)->shouldReturn('project-slug_step-slug.xlsx');
    }
}
