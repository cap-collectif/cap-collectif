<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectRepository;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ProjectResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    protected $projectRepository;

    public function __construct(ProjectRepository $projectRepository)
    {
        $this->projectRepository = $projectRepository;
    }

    public function resolveAdminEditUrl(Project $project, $absolute = true)
    {
        $router = $this->container->get('router');

        return $router->generate('admin_capco_app_project_edit', ['id' => $project->getId()],
            $absolute ? UrlGeneratorInterface::ABSOLUTE_URL : UrlGeneratorInterface::RELATIVE_PATH);
    }

    public function resolveIndexUrl($absolute = true)
    {
        $router = $this->container->get('router');

        return $router->generate('app_project', [],
            $absolute ? UrlGeneratorInterface::ABSOLUTE_URL : UrlGeneratorInterface::RELATIVE_PATH);
    }
}
