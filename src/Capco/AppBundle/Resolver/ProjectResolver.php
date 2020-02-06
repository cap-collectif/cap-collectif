<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectResolver
{
    protected $projectRepository;
    protected $router;
    protected $requestStack;

    public function __construct(ProjectRepository $projectRepository, RouterInterface $router, RequestStack $requestStack)
    {
        $this->projectRepository = $projectRepository;
        $this->router = $router;
        $this->requestStack = $requestStack;
    }

    public function resolveAdminEditUrl(Project $project, bool $absolute = true): string
    {
        return $this->router->generate('admin_capco_app_project_edit', ['id' => $project->getId(), '_locale' => $this->requestStack->getCurrentRequest()->getLocale()],
            $absolute ? UrlGeneratorInterface::ABSOLUTE_URL : UrlGeneratorInterface::RELATIVE_PATH);
    }

    public function resolveIndexUrl(bool $absolute = true): string
    {
        return $this->router->generate('app_project', [ '_locale' => $this->requestStack->getCurrentRequest()->getLocale()],
            $absolute ? UrlGeneratorInterface::ABSOLUTE_URL : UrlGeneratorInterface::RELATIVE_PATH);
    }
}
