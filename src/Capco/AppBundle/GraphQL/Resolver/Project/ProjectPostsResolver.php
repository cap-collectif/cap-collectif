<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\PostRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectPostsResolver implements ResolverInterface
{
    private PostRepository $repository;

    public function __construct(PostRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Project $project, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument(['first' => 2]);
        }

        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($project) {
            return $this->repository->getLastPublishedByProject(
                $project->getSlug(),
                $limit,
                $offset
            );
        });

        return $paginator->auto($args, $this->repository->countPublishedByProject($project));
    }
}
