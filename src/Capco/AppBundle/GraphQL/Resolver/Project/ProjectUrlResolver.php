<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Resolver\LocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectUrlResolver implements QueryInterface
{
    protected RouterInterface $router;
    protected RequestStack $requestStack;
    protected string $defaultLocale;
    protected StepUrlResolver $stepUrlResolver;

    public function __construct(
        RouterInterface $router,
        RequestStack $requestStack,
        LocaleResolver $localeResolver,
        StepUrlResolver $stepUrlResolver
    ) {
        $this->router = $router;
        $this->requestStack = $requestStack;
        $this->stepUrlResolver = $stepUrlResolver;
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
    }

    public function __invoke(Project $project): string
    {
        $locale = $this->requestStack->getCurrentRequest()->getLocale();
        if (null === $locale || empty($locale)) {
            $locale = $this->defaultLocale;
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
}
