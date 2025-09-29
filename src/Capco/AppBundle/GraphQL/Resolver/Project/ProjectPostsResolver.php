<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\PostRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectPostsResolver implements QueryInterface
{
    public function __construct(
        private readonly PostRepository $repository
    ) {
    }

    public function __invoke(Project $project, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument(['first' => 2]);
        }

        $paginator = new Paginator(fn (?int $offset, ?int $limit) => $this->repository->getLastPublishedByProject(
            $project->getSlug(),
            $limit,
            $offset
        ));

        return $paginator->auto($args, $this->repository->countPublishedByProject($project));
    }
}
