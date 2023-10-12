<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectAdminAlphaUrlResolver implements ResolverInterface
{
    protected RouterInterface $router;
    private Manager $manager;

    public function __construct(RouterInterface $router, Manager $manager)
    {
        $this->router = $router;
        $this->manager = $manager;
    }

    public function __invoke(Project $project): string
    {
        $isNewBackOfficeEnabled = $this->manager->isActive('unstable__new_create_project');

        if ($isNewBackOfficeEnabled) {
            $projectId = GlobalId::toGlobalId('Project', $project->getId());

            return "/admin-next/project/{$projectId}";
        }

        return $this->router->generate(
            'capco_admin_alpha_project_edit',
            [
                'id' => $project->getId(),
                '_sonata_admin' => 'capco_admin.admin.project',
                '_sonata_name' => 'admin_capco_app_project_edit',
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
