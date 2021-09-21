<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProjectExportContributorsResolver implements ResolverInterface
{
    private RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(Project $project): string
    {
        return $this->router->generate(
            'app_export_project_contributors',
            [
                'projectId' => $project->getId(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
