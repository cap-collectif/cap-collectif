<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Repository\MailingListRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class MailingListResolver implements QueryInterface
{
    private readonly MailingListRepository $repository;

    public function __construct(MailingListRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $argument)
    {
        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $argument
        ) {
            $results = $this->repository->findPaginated(
                $limit,
                $offset,
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
