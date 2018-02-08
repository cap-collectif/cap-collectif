<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectRepository;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectResolver
{
    protected $projectRepository;
    protected $router;

    public function __construct(ProjectRepository $projectRepository, RouterInterface $router)
    {
        $this->projectRepository = $projectRepository;
        $this->router = $router;
    }

    public function resolveAdminEditUrl(Project $project, $absolute = true)
    {
        return $this->router->generate('admin_capco_app_project_edit', ['id' => $project->getId()],
            $absolute ? UrlGeneratorInterface::ABSOLUTE_URL : UrlGeneratorInterface::RELATIVE_PATH);
    }

    public function resolveIndexUrl($absolute = true)
    {
        return $this->router->generate('app_project', [],
            $absolute ? UrlGeneratorInterface::ABSOLUTE_URL : UrlGeneratorInterface::RELATIVE_PATH);
    }
}
