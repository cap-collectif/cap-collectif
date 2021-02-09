<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DebateArgumentVotesResolver implements ResolverInterface
{
    public const ORDER_PUBLISHED_AT = 'PUBLISHED_AT';

    private DebateArgumentVoteRepository $repository;

    public function __construct(DebateArgumentVoteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(DebateArgument $debateArgument, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }
        $orderBy = self::getOrderBy($args);
        $paginator = new Paginator(function (int $offset, int $limit) use (
            $debateArgument,
            $orderBy
        ) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            return $this->repository
                ->getByDebateArgument($debateArgument, $limit, $offset, $orderBy)
                ->getIterator()
                ->getArrayCopy();
        });
        $totalCount = $this->repository->countByDebateArgument($debateArgument);

        return $paginator->auto($args, $totalCount);
    }

    private static function getOrderBy(Argument $args): ?array
    {
        $orderByFields = [
            'PUBLISHED_AT' => 'publishedAt'
        ];
        $orderBy = $args->offsetGet('orderBy');
        if ($orderBy) {
            $orderBy['field'] = $orderByFields[$orderBy['field']];
        }
        return $orderBy;
    }
}
