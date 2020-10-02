<?php

namespace Capco\AppBundle\GraphQL\Resolver\MailingList;

use Capco\AppBundle\Repository\MailingListRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class MailingListResolver implements ResolverInterface
{
    private MailingListRepository $repository;

    public function __construct(MailingListRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $argument)
    {
        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (&$totalCount) {
            $results = $this->repository->findPaginated($limit, $offset);
            $totalCount = \count($results);

            return $results;
        });

        $connection = $paginator->auto($argument, $totalCount);
        $connection->setTotalCount(42);

        return $connection;
    }
}
