<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Search\DebateSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class DebateAlternateArgumentsResolver implements ResolverInterface
{
    public const ORDER_PUBLISHED_AT = 'PUBLISHED_AT';
    public const ORDER_VOTE_COUNT = 'VOTE_COUNT';

    private DebateSearch $debateSearch;

    public function __construct(DebateSearch $debateSearch)
    {
        $this->debateSearch = $debateSearch;
    }

    public function __invoke(Debate $debate, Argument $args, ?User $viewer): ConnectionInterface
    {
        $paginator = new Paginator(function (int $offset, int $limit) use (
            $debate,
            $args,
            $viewer
        ) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }

            $orderBy = DebateArgumentsResolver::getOrderBy($args);
            $forArguments = $this->debateSearch->searchDebateArguments(
                $debate,
                $limit,
                $orderBy,
                DebateArgumentsResolver::getFilters($args, $viewer, 'FOR'),
                $offset
            );
            $againstArguments = $this->debateSearch->searchDebateArguments(
                $debate,
                $limit,
                $orderBy,
                DebateArgumentsResolver::getFilters($args, $viewer, 'AGAINST'),
                $offset
            );

            return self::generateAlternateArguments(
                $forArguments->getEntities(),
                $againstArguments->getEntities()
            );
        });

        $totalCount = $this->debateSearch
            ->searchDebateArguments(
                $debate,
                0,
                null,
                DebateArgumentsResolver::getFilters($args, $viewer)
            )
            ->getTotalCount();

        return $paginator->auto($args, $totalCount);
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
