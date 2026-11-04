<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reporting;

use Capco\AppBundle\Repository\ReportingRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ReportingListResolver implements QueryInterface
{
    public function __construct(
        private readonly ReportingRepository $reportingRepository
    ) {}

    public function __invoke(Argument $args): Connection
    {
        $totalCount = $this->reportingRepository->count([]);
        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->reportingRepository->getRecentPaginated($offset, $limit)
        );

        $connection = $paginator->auto($args, $totalCount);
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving reportings.');
        }
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
