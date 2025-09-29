<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\ContributionSearch;
use Capco\AppBundle\Search\Search;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\RequestStack;

class UserContributionResolver implements ContainerAwareInterface, QueryInterface
{
    use ContainerAwareTrait;

    public function __construct(
        private readonly ContributionSearch $contributionSearch
    ) {
    }

    public function __invoke(
        User $user,
        Argument $args,
        $viewer,
        RequestStack $request
    ): ConnectionInterface {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        [$type, $contribuableId, $includeTrashed, $field, $direction] = [
            $args->offsetGet('type'),
            $args->offsetGet('contribuableId'),
            $args->offsetGet('includeTrashed'),
            $args->offsetGet('orderBy')['field'],
            $args->offsetGet('orderBy')['direction'],
        ];

        $order = ContributionSearch::findOrderFromFieldAndDirection($field, $direction);
        $seed = Search::generateSeed($request, $viewer);

        $paginator = new ElasticSearchPaginator(fn (?string $cursor, int $limit) => $this->contributionSearch->getUserContributions(
            $user,
            $limit,
            $order,
            $seed,
            $contribuableId,
            $type,
            $cursor,
            [],
            $includeTrashed
        ));

        return $paginator->auto($args);
    }
}
