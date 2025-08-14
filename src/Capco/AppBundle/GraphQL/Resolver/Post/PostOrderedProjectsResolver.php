<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class PostOrderedProjectsResolver implements QueryInterface
{
    /**
     * @return Project[]
     */
    public function __invoke(Post $post): array
    {
        $projects = $post->getProjects()->toArray();

        usort($projects, fn (Project $projectA, Project $projectB) =>
            // slug is unique for projects
            $projectA->getSlug() <=> $projectB->getSlug());

        return $projects;
    }
}
