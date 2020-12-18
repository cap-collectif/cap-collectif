<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class DebateAlternateArgumentsResolver implements ResolverInterface
{
    public const ORDER_PUBLISHED_AT = 'PUBLISHED_AT';
    public const ORDER_VOTE_COUNT = 'VOTE_COUNT';

    private DebateArgumentRepository $repository;

    public function __construct(DebateArgumentRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Debate $debate, Argument $args, ?User $viewer): ConnectionInterface
    {
        $filters = DebateArgumentsResolver::getFilters($args, $viewer);
        $orderBy = DebateArgumentsResolver::getOrderBy($args);

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $debate,
            $args,
            $viewer,
            $orderBy
        ) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            return self::generateAlternateArguments(
                $this->getArguments(
                    $debate,
                    $limit,
                    $offset,
                    DebateArgumentsResolver::getFilters($args, $viewer, 'FOR'),
                    $orderBy
                ),
                $this->getArguments(
                    $debate,
                    $limit,
                    $offset,
                    DebateArgumentsResolver::getFilters($args, $viewer, 'AGAINST'),
                    $orderBy
                )
            );
        });
        $totalCount = $this->repository->countByDebate($debate, $filters);

        return $paginator->auto($args, $totalCount);
    }

    private function getArguments(
        Debate $debate,
        int $limit,
        int $offset,
        array $filters,
        array $orderBy
    ): array {
        return $this->repository
            ->getByDebate($debate, $limit, $offset, $filters, $orderBy)
            ->getIterator()
            ->getArrayCopy();
    }

    private static function generateAlternateArguments(
        array $forArguments,
        array $againstArguments
    ): array {
        $alternateArguments = [];
        $i = 0;
        while (isset($forArguments[$i]) || isset($againstArguments[$i])) {
            $alternateArguments[$i] = [
                'for' => null,
                'against' => null,
            ];
            if (isset($forArguments[$i])) {
                $alternateArguments[$i]['for'] = $forArguments[$i];
            }
            if (isset($againstArguments[$i])) {
                $alternateArguments[$i]['against'] = $againstArguments[$i];
            }
            ++$i;
        }

        return $alternateArguments;
    }
}
