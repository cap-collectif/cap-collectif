<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;

class StepUrlResolver implements ResolverInterface
{
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function __invoke(AbstractStep $step): string
    {
        if (!$step->getProject() || !$step->getProject()->getSlug() || !$step->getSlug()) {
            return '';
        }

        if ($step->isConsultationStep()) {
            return $this->router->generate(
                    'app_project_show_consultation',
                    ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
        }
        if ($step->isPresentationStep()) {
            return $this->router->generate(
                    'app_project_show_presentation',
                    ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
        }
        if ($step->isOtherStep()) {
            return $this->router->generate(
                    'app_project_show_step',
                    ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
        }
        if ($step->isSynthesisStep()) {
            return $this->router->generate(
                    'app_project_show_synthesis',
                    ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
        }
        if ($step->isRankingStep()) {
            return $this->router->generate(
                    'app_project_show_ranking',
                    ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
        }
        if ($step->isCollectStep()) {
            return $this->router->generate(
                    'app_project_show_collect',
                    ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
        }
        if ($step->isSelectionStep()) {
            return $this->router->generate(
                    'app_project_show_selection',
                    ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
        }
        if ($step->isQuestionnaireStep()) {
            return $this->router->generate(
                    'app_project_show_questionnaire',
                    ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
        }

        return '';
    }
}
