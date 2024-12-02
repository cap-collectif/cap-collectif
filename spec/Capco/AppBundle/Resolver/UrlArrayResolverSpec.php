<?php

namespace spec\Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Resolver\UrlArrayResolver;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Routing\Router;

class UrlArrayResolverSpec extends ObjectBehavior
{
    public function let(Router $router)
    {
        $this->beConstructedWith($router);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UrlArrayResolver::class);
    }

    public function it_should_generate_a_string_route_for_a_proposal(AbstractStep $step, Project $project, Router $router)
    {
        $project->getSlug()->willReturn('projet-1');
        $step->getProject()->willReturn($project);
        $step->getSlug()->willReturn('etape-1');
        $proposal['Step'] = $step;
        $proposal['slug'] = 'proposal-1';
        $proposal['entity_type'] = 'proposal';

        $expectedUrl = 'http://capco.dev/project/projet-1/consultation/etape-1/opinions/proposal-1';

        $router->generate(
            'app_project_show_proposal',
            [
                'projectSlug' => 'projet-1',
                'stepSlug' => 'etape-1',
                'proposalSlug' => 'proposal-1',
            ],
            0
        )->shouldBeCalled()->willReturn($expectedUrl);

        $this->getRoute($proposal)->shouldReturn($expectedUrl);
    }

    public function it_should_generate_a_string_route_for_an_opinion(AbstractStep $step, Project $project, Router $router)
    {
        $project->getSlug()->willReturn('projet-1');
        $step->getProject()->willReturn($project);
        $step->getSlug()->willReturn('etape-1');
        $opinion['Step'] = $step;
        $opinion['OpinionType']['slug'] = 'consultation-1';
        $opinion['slug'] = 'opinion-1';
        $opinion['entity_type'] = 'opinion';

        $expectedUrl = 'http://capco.dev/project/projet-1/consultation/consultation-1/opinions/consultation-1/opinion-1';

        $router->generate(
            'app_project_show_opinion',
            [
                'projectSlug' => 'projet-1',
                'stepSlug' => 'etape-1',
                'opinionTypeSlug' => 'consultation-1',
                'opinionSlug' => 'opinion-1',
            ],
            0
        )->shouldBeCalled()->willReturn($expectedUrl);

        $this->getRoute($opinion)->shouldReturn($expectedUrl);
    }

    public function it_should_generate_a_string_route_for_an_opinion_version(AbstractStep $step, Project $project, Router $router)
    {
        $project->getSlug()->willReturn('projet-1');
        $step->getProject()->willReturn($project);
        $step->getSlug()->willReturn('etape-1');
        $version['Step'] = $step;
        $version['OpinionType']['slug'] = 'consultation-1';
        $version['slug'] = 'opinion-1';
        $version['entity_type'] = 'opinionVersion';
        $version['parent']['slug'] = 'parent-1';

        $expectedUrl = 'http://capco.dev/project/projet-1/consultation/consultation-1/opinions/consultation-1/opinion-1';

        $router->generate(
            'app_project_show_opinion_version',
            [
                'projectSlug' => 'projet-1',
                'stepSlug' => 'etape-1',
                'opinionTypeSlug' => 'consultation-1',
                'opinionSlug' => 'parent-1',
                'versionSlug' => 'opinion-1',
            ],
            0
        )->shouldBeCalled()->willReturn($expectedUrl);

        $this->getRoute($version)->shouldReturn($expectedUrl);
    }
}
