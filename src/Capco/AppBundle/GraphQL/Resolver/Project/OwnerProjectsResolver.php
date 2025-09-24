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

        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use ($args, $orderBy, $viewer, $owner, &$totalCount): array {
            $result = $this->repository->getByOwnerPaginated(
                $owner,
                $offset,
                $limit,
                $viewer,
                $orderBy,
                $args->offsetGet('status'),
                $args->offsetGet('query')
            );

            $totalCount = \count($result);

            return $result;
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

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
