<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Resolver\LocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class StepUrlResolver implements ResolverInterface
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

    public function __invoke(AbstractStep $step): string
    {
        if (!$step->getSlug() || !$step->getProject() || !$step->getProject()->getSlug()) {
            return '';
        }
        $locale = $this->defaultLocale;
        $request = $this->requestStack->getCurrentRequest();
        if ($request) {
            $locale = $request->getLocale();
        }

        if ($step->isConsultationStep()) {
            // @var ConsultationStep $step
            return $this->router->generate(
                $step->isMultiConsultation()
                    ? 'app_project_show_consultations'
                    : 'app_project_show_consultation',
                [
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    '_locale' => $locale
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        if ($step->isPresentationStep()) {
            return $this->router->generate(
                'app_project_show_presentation',
                [
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    '_locale' => $locale
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        if ($step->isOtherStep()) {
            return $this->router->generate(
                'app_project_show_step',
                [
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    '_locale' => $locale
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        if ($step->isSynthesisStep()) {
            return $this->router->generate(
                'app_project_show_synthesis',
                [
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    '_locale' => $locale
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        if ($step->isRankingStep()) {
            return $this->router->generate(
                'app_project_show_ranking',
                [
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    '_locale' => $locale
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        if ($step->isCollectStep()) {
            return $this->router->generate(
                'app_project_show_collect',
                [
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    '_locale' => $locale
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        if ($step->isSelectionStep()) {
            return $this->router->generate(
                'app_project_show_selection',
                [
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    '_locale' => $locale
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        if ($step->isQuestionnaireStep()) {
            return $this->router->generate(
                'app_project_show_questionnaire',
                [
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    '_locale' => $locale
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        return '';
    }
}
