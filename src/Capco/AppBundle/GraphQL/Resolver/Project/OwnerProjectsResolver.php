<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Interfaces\ProjectOwner;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OwnerProjectsResolver implements ResolverInterface
{
    private ProjectRepository $repository;

    public function __construct(ProjectRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(
        ProjectOwner $owner,
        Argument $args,
        ?User $viewer = null
    ): ConnectionInterface {

        $paginator = new Paginator(function (int $offset, int $limit) use ($owner, $viewer) {
            return $this->repository->getByOwnerPaginated(
                $owner,
                $offset,
                $limit,
                $viewer
            );
        });

        return $paginator->auto($args, $this->repository->countByOwner($owner, $viewer));
    }
}