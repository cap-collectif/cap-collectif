<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Interfaces\ProjectOwner;
use Capco\AppBundle\Enum\ProjectOrderField;
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

        $orderBy = $this->getOrderBy($args);

        $paginator = new Paginator(function (int $offset, int $limit) use ($owner, $viewer, $orderBy) {
            return $this->repository->getByOwnerPaginated(
                $owner,
                $offset,
                $limit,
                $viewer,
                $orderBy
            );
        });

        return $paginator->auto($args, $this->repository->countByOwner($owner, $viewer));
    }

    private function getOrderBy($args): ?array
    {
        $orderBy = $args->offsetGet('orderBy');
        if (!$orderBy) return null;

        $field = ProjectOrderField::MAP[$orderBy['field']];
        $orderBy['field'] = $field;
        return $orderBy;
    }
}