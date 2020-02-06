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
use Capco\AppBundle\Resolver\LocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectUrlResolver implements ResolverInterface
{
    protected $router;
    protected $requestStack;
    protected $defaultLocale;

    public function __construct(
        RouterInterface $router,
        RequestStack $requestStack,
        LocaleResolver $localeResolver
    ) {
        $this->router = $router;
        $this->requestStack = $requestStack;
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
    }

    public function __invoke(Project $project): string
    {
        $locale = $this->requestStack->getCurrentRequest()->getLocale();
        if (null === $locale || empty($locale)) {
            $locale = $this->defaultLocale;
        }
        $projectSlug = $project->getSlug();
        $firstStep = $project->getFirstStep();
        // if no step, so we redirect to projects list page
        if (!$firstStep) {
            return $this->router->generate(
                'app_project',
                ['_locale' => $locale],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        $routeName = 'app_consultation_show_presentation';
        if ($firstStep instanceof CollectStep) {
            $routeName = 'app_project_show_collect';
        } elseif ($firstStep instanceof ConsultationStep) {
            $routeName = $firstStep->isMultiConsultation()
                ? 'app_project_show_consultations'
                : 'app_project_show_consultation';
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
            [
                'projectSlug' => $projectSlug,
                'stepSlug' => $firstStep->getSlug(),
                '_locale' => $locale
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
