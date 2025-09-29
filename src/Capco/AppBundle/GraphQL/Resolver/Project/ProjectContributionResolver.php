<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Search\ContributionSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectContributionResolver implements QueryInterface
{
    public function __construct(
        protected ContributionSearch $contributionSearch,
        private readonly RedisCache $cache
    ) {
    }

    public function __invoke(Project $project, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }
        $totalCount = 0;
        $isInternalProject = !$project->isExternal();
        if ($isInternalProject) {
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

                if ('REPLY_ANONYMOUS' === $args->offsetGet('type')) {
                    $filters['_type'] = ['replyAnonymous'];
                } else {
                    $filters['_type'] = $args->offsetGet('type')
                        ? [
                            \call_user_func([
                                ContributionSearch::CONTRIBUTION_TYPE_CLASS_MAPPING[
                                    $args->offsetGet('type')
                                ],
                                'getElasticsearchTypeName',
                            ]),
                        ]
                        : null;
                }

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

    public function getTotalContributionsCountsByTypes(string $projectId, array $objectTypes): array
    {
        $cacheKey = 'totalContributionsCounts-' . $projectId;
        $cachedTotalContributionCount = $this->cache->getItem($cacheKey);

        if ($cachedTotalContributionCount->isHit()) {
            return $cachedTotalContributionCount->get();
        }

        $counters = [];
        $response = $this->contributionSearch
            ->getContributionsCountsByProject($projectId, $objectTypes)
            ->getAggregation('contributionsCountsByType')
        ;
        foreach ($objectTypes as $objectType) {
            $counters[$objectType] = 0;
            foreach ($response['buckets'] as $bucket) {
                if ($bucket['key'] === $objectType) {
                    $counters[$objectType] = $bucket['doc_count'];
                }
            }
        }

        $cachedTotalContributionCount->set($counters)->expiresAfter(RedisCache::ONE_MINUTE);
        $this->cache->save($cachedTotalContributionCount);

        return $counters;
    }
}
