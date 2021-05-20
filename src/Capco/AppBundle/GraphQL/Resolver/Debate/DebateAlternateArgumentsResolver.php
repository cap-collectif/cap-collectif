<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\AppBundle\Search\DebateSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

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
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $debate,
            $args,
            $viewer
        ) {
            $cursors = self::decodeCursor($cursor);
            $orderBy = DebateArgumentsResolver::getOrderBy($args);

            $forArguments = $this->debateSearch->searchDebateArguments(
                $debate,
                $limit,
                $orderBy,
                DebateArgumentsResolver::getFilters($args, $viewer, 'FOR'),
                $cursors['for']
            );
            $againstArguments = $this->debateSearch->searchDebateArguments(
                $debate,
                $limit,
                $orderBy,
                DebateArgumentsResolver::getFilters($args, $viewer, 'AGAINST'),
                $cursors['against']
            );

            return self::generateResults(
                $forArguments->getEntities(),
                $againstArguments->getEntities()
            );
        });

        $totalCount = $this->getTotalCount($debate, $args, $viewer);

        $connection = $paginator->auto($args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    private function getTotalCount(Debate $debate, Argument $args, ?User $viewer): int
    {
        return $this->debateSearch
            ->searchDebateArguments(
                $debate,
                0,
                null,
                DebateArgumentsResolver::getFilters($args, $viewer)
            )
            ->getTotalCount();
    }

    private static function generateResults(
        array $forArguments,
        array $againstArguments
    ): ElasticsearchPaginatedResult {
        $alternateArguments = [];
        $cursors = [];
        $i = 0;

        while (isset($forArguments[$i]) || isset($againstArguments[$i])) {
            if (!isset($forArguments[$i])) {
                $forArguments[$i] = null;
            } elseif (!isset($againstArguments[$i])) {
                $againstArguments[$i] = null;
            }
            $alternateArguments[$i] = self::generateAlternateArgument(
                $forArguments[$i],
                $againstArguments[$i]
            );
            $cursors[$i] = self::generateHalfCursors($forArguments[$i], $againstArguments[$i]);
            ++$i;
        }

        return new ElasticsearchPaginatedResult($alternateArguments, $cursors);
    }

    private static function generateAlternateArgument(
        ?DebateArgumentInterface $forArgument,
        ?DebateArgumentInterface $againstArgument
    ): array {
        return [
            'for' => $forArgument ?? null,
            'against' => $againstArgument ?? null,
        ];
    }

    private static function generateHalfCursors(
        ?DebateArgumentInterface $forArgument,
        ?DebateArgumentInterface $againstArgument
    ): array {
        return [
            'for' => $forArgument ? self::encodeHalfCursor($forArgument) : null,
            'against' => $againstArgument ? self::encodeHalfCursor($againstArgument) : null,
        ];
    }

    private static function encodeHalfCursor(DebateArgumentInterface $argument): string
    {
        return base64_encode(
            serialize([$argument->getCreatedAt()->getTimestamp() * 1000, $argument->getId()])
        );
    }

    private static function decodeCursor(?string $cursor): array
    {
        return $cursor
            ? unserialize(base64_decode($cursor))
            : [
                'for' => null,
                'against' => null,
            ];
    }
}
