<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OpinionAdminListResolver implements QueryInterface
{
    public function __construct(
        private readonly OpinionRepository $opinionRepository
    ) {}

    public function __invoke(Argument $args, User $viewer): Connection
    {
        $search = $args['search'] ?? null;
        $totalCount = $this->opinionRepository->countAdmin($viewer, $search);
        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->opinionRepository->getAdminPaginated($viewer, $search, $offset, $limit)
        );

        $connection = $paginator->auto($args, $totalCount);
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving opinions.');
        }
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
