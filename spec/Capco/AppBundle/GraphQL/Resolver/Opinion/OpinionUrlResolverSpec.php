<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Opinion;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;

class OpinionUrlResolverSpec extends ObjectBehavior
{
    public function let(
        RouterInterface $router,
        ConsultationStepRepository $repository,
        LoggerInterface $logger
    ): void {
        $this->beConstructedWith($repository, $router, $logger);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(OpinionUrlResolver::class);
    }

    public function it_return_correctly(
        Opinion $contribution,
        ConsultationStep $step,
        Project $project,
        OpinionType $contributionType,
        ConsultationStepRepository $repository,
        RouterInterface $router
    ): void {
        $contribution->getId()->willReturn('opinionId');
        $contributionType->getSlug()->willReturn('opiniontype');
        $repository->getByOpinionId('opinionId')->willReturn($step);
        $contribution->getStep()->willReturn($step);
        $contribution->getSlug()->willReturn('myopinion');
        $contribution->getOpinionType()->willReturn($contributionType);

        $step->getProject()->willReturn($project);
        $step->getSlug()->willReturn('mystep');
        $project->getSlug()->willReturn('myproject');

        $contribution->getProject()->willReturn($project);

        $router
            ->generate(
                'app_consultation_show_opinion',
                [
                    'projectSlug' => 'myproject',
                    'stepSlug' => 'mystep',
                    'opinionTypeSlug' => 'opiniontype',
                    'opinionSlug' => 'myopinion'
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            )
            ->willReturn('http://capco.test/myproject/mystep/opiniontype/myopinion');

        $this->__invoke($contribution)->shouldNotReturn('');
    }

    public function it_return_empty_with_no_opinion_step(
        Opinion $contribution,
        ConsultationStepRepository $repository
    ): void {
        $repository->getByOpinionId('opinionId')->willReturn(null);
        $contribution->getId()->willReturn('opinionId');
        $contribution->getStep()->willReturn(null);
        $this->__invoke($contribution)->shouldReturn('');
    }

    public function it_return_empty_with_no_opinion_project(
        Opinion $contribution,
        ConsultationStep $step,
        ConsultationStepRepository $repository
    ): void {
        $repository->getByOpinionId('opinionId')->willReturn($step);
        $contribution->getId()->willReturn('opinionId');
        $step->getProject()->willReturn(null);
        $contribution->getProject()->willReturn(null);
        $this->__invoke($contribution)->shouldReturn('');
    }
}
