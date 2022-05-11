<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectAdminUrlResolver implements ResolverInterface
{
    protected $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(Project $project): string
    {
        return $this->router->generate(
            'admin_capco_app_project_edit',
            [
                'id' => $project->getId(),
                '_sonata_admin' => 'capco_admin.admin.project',
                '_sonata_name' => 'admin_capco_app_project_edit',
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
