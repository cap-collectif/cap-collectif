<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\LocaleResolver;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectUrlResolver implements ResolverInterface
{
    protected $router;
    protected $requestStack;
    protected $defaultLocale;
    protected $stepUrlResolver;

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

        return $this->stepUrlResolver->__invoke($firstStep);
    }
}
