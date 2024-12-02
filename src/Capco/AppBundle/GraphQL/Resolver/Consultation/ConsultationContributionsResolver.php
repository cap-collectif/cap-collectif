<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Search\ContributionSearch;
use Capco\AppBundle\Search\Search;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ConsultationContributionsResolver implements QueryInterface
{
    public function __construct(private readonly ContributionSearch $contributionSearch)
    {
    }

    public function __invoke(
        Consultation $consultation,
        Argument $args,
        $viewer,
        RequestStack $request
    ): ConnectionInterface {
        $includeTrashed = $args->offsetGet('includeTrashed');
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $consultation,
            $includeTrashed,
            $args,
            $viewer,
            $request
        ) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $order = ContributionSearch::findOrderFromFieldAndDirection($field, $direction);
            $seed = Search::generateSeed($request, $viewer);

            return $this->contributionSearch->getContributionsByConsultation(
                $consultation->getId(),
                $order,
                $seed,
                $limit,
                $cursor,
                $includeTrashed
            );
        });

        return $paginator->auto($args);
    }
}
