<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Search\ContributionSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectContributionResolver implements ResolverInterface
{
    protected ContributionSearch $contributionSearch;

    public function __construct(ContributionSearch $contributionSearch)
    {
        $this->contributionSearch = $contributionSearch;
    }

    public function __invoke(Project $project, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }
        $totalCount = 0;
        if (!$project->isExternal()) {
            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                &$totalCount,
                $project,
                $args
            ) {
                $filters = [];
                if ($args->offsetExists('orderBy')) {
                    $field = $args->offsetGet('orderBy')['field'];
                    $direction = $args->offsetGet('orderBy')['direction'];
                    $order = ContributionSearch::findOrderFromFieldAndDirection($field, $direction);
                } else {
                    $order = 'last';
                }

                $filters['_type'] = $args->offsetExists('type')
                    ? [
                        \call_user_func([
                            ContributionSearch::CONTRIBUTION_TYPE_CLASS_MAPPING[
                                $args->offsetGet('type')
                            ],
                            'getElasticsearchTypeName',
                        ]),
                    ]
                    : null;

                $response = $this->contributionSearch->getContributionsByProject(
                    $project->getId(),
                    $order,
                    $filters,
                    $limit,
                    $cursor
                );
                $totalCount = $response->getTotalCount();

                return $response;
            });
        } else {
            $paginator = new Paginator(static function () use (&$totalCount, $project) {
                $totalCount = $project->getExternalContributionsCount() ?? 0;

                return [];
            });
        }

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
