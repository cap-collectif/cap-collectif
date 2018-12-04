<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectLinksResolver implements ResolverInterface
{
    public function __invoke(Project $project): array
    {
        return isset($project->_links) ? $project->_links : [];
    }
}
