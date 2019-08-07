<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectUrlResolver implements ResolverInterface
{
    protected $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(Project $project): string
    {
        $projectSlug = $project->getSlug();
        $firstStep = $project->getFirstStep();
        // if no step, so we redirect to projects list page
        if (!$firstStep) {
            return $this->router->generate('app_project', [], UrlGeneratorInterface::ABSOLUTE_URL);
        }
        $routeName = 'app_consultation_show_presentation';
        if ($firstStep instanceof CollectStep) {
            $routeName = 'app_project_show_collect';
        } elseif ($firstStep instanceof ConsultationStep) {
            if ($firstStep->getConsultations()->count() <= 1) {
                $routeName = 'app_project_show_consultation';
            } else {
                $routeName = 'app_project_show_consultations';
            }
        } elseif ($firstStep instanceof QuestionnaireStep) {
            $routeName = 'app_project_show_questionnaire';
        } elseif ($firstStep instanceof SelectionStep) {
            $routeName = 'app_project_show_selection';
        } elseif ($firstStep instanceof SynthesisStep) {
            $routeName = 'app_project_show_synthesis';
        } elseif ($firstStep instanceof OtherStep) {
            $routeName = 'app_project_show_step';
        } elseif ($firstStep instanceof RankingStep) {
            $routeName = 'app_project_show_ranking';
        }

        return $this->router->generate(
            $routeName,
            ['projectSlug' => $projectSlug, 'stepSlug' => $firstStep->getSlug()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
