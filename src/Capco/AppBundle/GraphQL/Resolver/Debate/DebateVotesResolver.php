<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\UserBundle\Entity\User;
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

    public function __invoke(
        Debate $debate,
        Argument $args,
        ?User $viewer = null
    ): ConnectionInterface {
        $filters = self::getFilters($args, $viewer);
        $orderBy = $args->offsetGet('orderBy');

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $debate,
            $filters,
            $orderBy
        ) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            return $this->repository
                ->getByDebate($debate, $limit, $offset, $orderBy, $filters)
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->repository->countByDebate($debate, $filters);

        return $paginator->auto($args, $totalCount);
    }

    public static function getFilters(Argument $args, ?User $viewer = null): array
    {
        $filters = [];
        $filters['type'] = $args->offsetGet('type');

        if (null === $viewer || !$viewer->isAdmin()) {
            $filters['isPublished'] = true;
        } else {
            $filters['isPublished'] = $args->offsetGet('isPublished');
        }

        return $filters;
    }
}
