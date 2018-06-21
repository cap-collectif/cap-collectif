<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;

class ProjectUrlResolver
{
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function __invoke(Project $project): string
    {
        $projectSlug = $project->getSlug();
        $firstStep = null !== $project->getFirstStep() ? $project->getFirstStep()->getSlug() : '';

        return $this->router->generate('app_project_show_collect',['projectSlug' => $projectSlug, 'stepSlug' => $firstStep],
            UrlGeneratorInterface::ABSOLUTE_URL);
    }
}
