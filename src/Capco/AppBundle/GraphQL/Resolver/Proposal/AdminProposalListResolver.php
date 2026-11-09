<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\GraphQL\ExtraFieldsConnection;
use Capco\AppBundle\Repository\ProposalRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class AdminProposalListResolver implements QueryInterface
{
    private const SOFT_DELETED_FILTER = 'softdeleted';

    public function __construct(
        private readonly ProposalRepository $proposalRepository,
        private readonly EntityManagerInterface $entityManager
    ) {}

    public function __invoke(Argument $args): Connection
    {
        $search = $args['search'] ?? null;

        // Like the former Sonata list, admins also see the deleted proposals
        $filters = $this->entityManager->getFilters();
        $isSoftDeletedFilterEnabled = $filters->isEnabled(self::SOFT_DELETED_FILTER);
        if ($isSoftDeletedFilterEnabled) {
            $filters->disable(self::SOFT_DELETED_FILTER);
        }

        try {
            $paginator = new Paginator(
                fn (?int $offset = null, ?int $limit = null) => $this->proposalRepository->getAdminPaginated(
                    $search,
                    $offset,
                    $limit
                )
            );
            $connection = $paginator->auto($args, $this->proposalRepository->countAdminPaginated($search));
        } finally {
            if ($isSoftDeletedFilterEnabled) {
                $filters->enable(self::SOFT_DELETED_FILTER);
            }
        }

        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving proposals.');
        }

        // ProposalConnection declares a non-nullable fusionCount, irrelevant for this list
        $proposalConnection = new ExtraFieldsConnection($connection->getEdges(), $connection->getPageInfo());
        $proposalConnection->setTotalCount($connection->getTotalCount());

        return $proposalConnection;
    }
}
