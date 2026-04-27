<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectTab;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectUrlResolver implements QueryInterface
{
    protected string $defaultLocale;

    public function __construct(
        protected RouterInterface $router,
        protected RequestStack $requestStack,
        LocaleResolver $localeResolver,
        protected StepUrlResolver $stepUrlResolver,
        protected ?Manager $toggleManager = null
    ) {
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
    }

    public function __invoke(Project $project): string
    {
        $locale = $this->requestStack->getCurrentRequest()->getLocale();
        if (null === $locale || empty($locale)) {
            $locale = $this->defaultLocale;
        }

        if ($this->toggleManager?->isActive(Manager::new_project_page)) {
            return $this->resolveProjectPageUrl($project, $locale);
        }

        $firstStep = $project->getFirstStep();
        // if no step, so we redirect to projects list page
        if (!$firstStep instanceof AbstractStep) {
            return $this->router->generate(
                'app_project',
                ['_locale' => $locale],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        return $this->stepUrlResolver->__invoke($firstStep);
    }

    private function resolveProjectPageUrl(Project $project, string $locale): string
    {
        $enabledTabsCount = $project->getTabs()->filter(
            static fn (ProjectTab $tab): bool => $tab->isEnabled()
        )->count();
        $firstStep = $project->getFirstStep();

        if (0 === $enabledTabsCount && $firstStep instanceof AbstractStep && 1 === $project->getSteps()->count()) {
            return $this->stepUrlResolver->__invoke($firstStep);
        }

        if (0 === $enabledTabsCount && !$firstStep instanceof AbstractStep) {
            return $this->router->generate(
                'app_project',
                ['_locale' => $locale],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        return $this->router->generate(
            'app_project_show_project',
            [
                'projectSlug' => $project->getSlug(),
                '_locale' => $locale,
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
