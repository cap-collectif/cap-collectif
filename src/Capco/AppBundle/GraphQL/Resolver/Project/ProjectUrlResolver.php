<?php
namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
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
        $firstStep = $project->getFirstStep();
        $routeName = 'app_consultation_show_presentation';
        if ($firstStep instanceof CollectStep) {
            $routeName = 'app_project_show_collect';
        }
        if ($firstStep instanceof ConsultationStep) {
            $routeName = 'app_project_show_consultation';
        }
        // if no step, so we redirect to projects list page
        if (!$firstStep) {
            return '/projects';
        }

        return $this->router->generate(
            $routeName,
            ['projectSlug' => $projectSlug, 'stepSlug' => $firstStep->getSlug()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
