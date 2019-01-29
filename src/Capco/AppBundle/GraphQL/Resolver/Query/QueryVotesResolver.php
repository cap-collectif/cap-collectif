<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\AbstractVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QueryVotesResolver implements ResolverInterface
{
    protected $votesRepository;

    public function __construct(AbstractVoteRepository $votesRepository)
    {
        $this->votesRepository = $votesRepository;
    }

    public function __invoke(Argument $args): Connection
    {
        $totalCount = 0;

        $paginator = new Paginator(function (int $offset, int $limit) {
            $votes = $this->votesRepository->findAllVotes($limit, $offset);

            return $votes->getIterator()->getArrayCopy();
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $this->votesRepository->count([]);

        return $connection;
    }
}
