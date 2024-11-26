<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class EmailingCampaignResolver implements QueryInterface
{
    private readonly EmailingCampaignRepository $repository;

    public function __construct(EmailingCampaignRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $argument): ConnectionInterface
    {
        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $argument
        ) {
            $results = $this->repository->search(
                $offset,
                $limit,
                $argument->offsetGet('status'),
                $argument->offsetGet('orderBy')['field'],
                $argument->offsetGet('orderBy')['direction'],
                $argument->offsetGet('term')
            );
            $totalCount = \count($results);

            return $results;
        });

        $connection = $paginator->auto($argument, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
