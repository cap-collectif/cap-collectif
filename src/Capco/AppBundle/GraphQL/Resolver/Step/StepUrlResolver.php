<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Symfony\Component\Routing\RouterInterface;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Doctrine\Common\Util\ClassUtils;

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

        $routeName = null;
        switch (ClassUtils::getClass($step)) {
            case PresentationStep::class:
                $routeName = 'app_consultation_show_presentation';

                break;
            case CollectStep::class:
                $routeName = 'app_project_show_collect';

                break;
            case SelectionStep::class:
                $routeName = 'app_project_show_selection';

                break;
            case QuestionnaireStep::class:
                $routeName = 'app_project_show_questionnaire';

                break;
            case ConsultationStep::class:
                $routeName = $step->isMultiConsultation()
                    ? 'app_project_show_consultations'
                    : 'app_project_show_consultation';

                break;
            case OtherStep::class:
                $routeName = 'app_project_show_step';

                break;
            case RankingStep::class:
                $routeName = 'app_project_show_ranking';

                break;
            case DebateStep::class:
                $routeName = 'app_project_show_debate';

                break;
            default:
                throw new \RuntimeException("Could not resolve a route for a step.'");
        }

        return $this->router->generate(
            $routeName,
            [
                'projectSlug' => $step->getProject()->getSlug(),
                'stepSlug' => $step->getSlug(),
                '_locale' => $locale,
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
