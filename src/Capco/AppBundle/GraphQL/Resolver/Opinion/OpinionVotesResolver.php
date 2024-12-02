<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Enum\OpinionOrderField;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OpinionVotesResolver implements QueryInterface
{
    public function __construct(private readonly OpinionVoteRepository $opinionVoteRepository, private readonly OpinionVersionVoteRepository $versionVoteRepository)
    {
    }

    public function __invoke(
        OpinionContributionInterface $contribution,
        ?Argument $args = null
    ): Connection {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
                'orderBy' => [
                    'field' => OpinionOrderField::PUBLISHED_AT,
                    'direction' => OrderDirection::DESC,
                ],
            ]);
        }

        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];

        $repo = $this->opinionVoteRepository;
        if ($contribution instanceof OpinionVersion) {
            $repo = $this->versionVoteRepository;
        }

        if ($args->offsetExists('value')) {
            $value = $args->offsetGet('value');
            $paginator = new Paginator(fn (int $offset, int $limit) => $repo
                ->getByContributionAndValue(
                    $contribution,
                    $value,
                    $limit,
                    $offset,
                    $field,
                    $direction
                )
                ->getIterator()
                ->getArrayCopy());
            $totalCount = $repo->countByContributionAndValue($contribution, $value);

            return $paginator->auto($args, $totalCount);
        }

        $paginator = new Paginator(fn (int $offset, int $limit) => $repo
            ->getByContribution($contribution, $limit, $offset, $field, $direction)
            ->getIterator()
            ->getArrayCopy());
        $totalCount = $repo->countByContribution($contribution);

        return $paginator->auto($args, $totalCount);
    }
}
