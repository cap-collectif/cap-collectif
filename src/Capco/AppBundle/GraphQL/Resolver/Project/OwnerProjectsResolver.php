<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Interfaces\ProjectOwner;
use Capco\AppBundle\Enum\ProjectOrderField;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OwnerProjectsResolver implements QueryInterface
{
    public function __construct(private readonly ProjectRepository $repository)
    {
    }

    public function __invoke(
        ProjectOwner $owner,
        Argument $args,
        ?User $viewer = null
    ): ConnectionInterface {
        $orderBy = $this->getOrderBy($args);
        $projectStatus = $args->offsetGet('status') ?? null;
        $hasProjectStatus = null !== $projectStatus;

        $getProjectsByOwnerPaginated = fn (int $offset, int $limit): array => $this->repository->getByOwnerPaginated(
            $owner,
            $offset,
            $limit,
            $viewer,
            $orderBy,
            $projectStatus
        )
        ;

        $totalCount = $hasProjectStatus
            ? \count($getProjectsByOwnerPaginated(0, \PHP_INT_MAX))
            : $this->repository->countByOwner($owner, $viewer);

        $paginator = new Paginator(fn (int $offset, int $limit): array => $getProjectsByOwnerPaginated($offset, $limit));

        $connection = $paginator->auto($args, $totalCount);

        if ($projectStatus) {
            $connection->setTotalCount($totalCount);
        }

        return $connection;
    }

    private function getOrderBy($args): ?array
    {
        $orderBy = $args->offsetGet('orderBy');
        if (!$orderBy) {
            return null;
        }

        $field = ProjectOrderField::MAP[$orderBy['field']];
        $orderBy['field'] = $field;

        return $orderBy;
    }
}
