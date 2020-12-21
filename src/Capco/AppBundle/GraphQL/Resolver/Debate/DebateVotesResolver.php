<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DebateVotesResolver implements ResolverInterface
{
    private DebateVoteRepository $repository;

    public function __construct(DebateVoteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Debate $debate, Argument $args): ConnectionInterface
    {
        $filterByType = $args->offsetGet('type');
        $orderBy = $args->offsetGet('orderBy');

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $debate,
            $filterByType,
            $orderBy
        ) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            return $this->repository
                ->getByDebate($debate, $limit, $offset, $filterByType, $orderBy)
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->repository->countByDebate($debate, $filterByType);

        return $paginator->auto($args, $totalCount);
    }
}
