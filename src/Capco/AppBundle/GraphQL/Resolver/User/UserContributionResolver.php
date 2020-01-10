<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\ContributionSearch;
use Capco\AppBundle\Search\Search;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\RequestStack;

class UserContributionResolver implements ContainerAwareInterface, ResolverInterface
{
    use ContainerAwareTrait;

    private $contributionSearch;

    public function __construct(ContributionSearch $contributionSearch)
    {
        $this->contributionSearch = $contributionSearch;
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

        list($type, $contribuableId, $includeTrashed, $field, $direction) = [
            $args->offsetGet('type'),
            $args->offsetGet('contribuableId'),
            $args->offsetGet('includeTrashed'),
            $args->offsetGet('orderBy')['field'],
            $args->offsetGet('orderBy')['direction']
        ];

        $order = ContributionSearch::findOrderFromFieldAndDirection($field, $direction);
        $seed = Search::generateSeed($request, $viewer);

        $paginator = new ElasticSearchPaginator(function (?string $cursor, int $limit) use (
            $type,
            $contribuableId,
            $user,
            $includeTrashed,
            $order,
            $seed
        ) {
            return $this->contributionSearch->getUserContributions(
                $user,
                $limit,
                $order,
                $seed,
                $contribuableId,
                $type,
                $cursor,
                [],
                $includeTrashed
            );
        });

        return $paginator->auto($args);
    }
}
