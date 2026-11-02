<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ProjectAdminAlphaUrlResolver implements QueryInterface
{
    public function __invoke(Project $project): string
    {
        $projectId = GlobalId::toGlobalId('Project', $project->getId());

        return "/admin-next/project/{$projectId}";
    }
}
