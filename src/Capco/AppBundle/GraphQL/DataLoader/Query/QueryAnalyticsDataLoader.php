<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Query;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Client\CloudflareElasticClient;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\DTO\Analytics\AnalyticsAnonymousContributors;
use Capco\AppBundle\DTO\Analytics\AnalyticsComments;
use Capco\AppBundle\DTO\Analytics\AnalyticsContributions;
use Capco\AppBundle\DTO\Analytics\AnalyticsContributors;
use Capco\AppBundle\DTO\Analytics\AnalyticsFollowers;
use Capco\AppBundle\DTO\Analytics\AnalyticsPageViews;
use Capco\AppBundle\DTO\Analytics\AnalyticsRegistrations;
use Capco\AppBundle\DTO\Analytics\AnalyticsTrafficSources;
use Capco\AppBundle\DTO\Analytics\AnalyticsMostVisitedPages;
use Capco\AppBundle\DTO\Analytics\AnalyticsVisitors;
use Capco\AppBundle\DTO\Analytics\AnalyticsVotes;
use Capco\AppBundle\Elasticsearch\AnalyticsTopContributors;
use Capco\AppBundle\Elasticsearch\AnalyticsMostUsedProposalCategories;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Search\AnalyticsSearch;
use DateTimeInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class QueryAnalyticsDataLoader extends BatchDataLoader
{
    private AnalyticsSearch $analyticsSearch;
    private CloudflareElasticClient $cloudflareElasticClient;
    private AnalyticsTopContributors $analyticsTopContributors;
    private AnalyticsMostUsedProposalCategories $analyticsMostUsedProposalCategories;
    private ProjectRepository $projectRepository;

    public function __construct(
        AnalyticsSearch $analyticsSearch,
        ProjectRepository $projectRepository,
        CloudflareElasticClient $cloudflareElasticClient,
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache,
        AnalyticsTopContributors $analyticsTopContributors,
        AnalyticsMostUsedProposalCategories $analyticsMostUsedProposalCategories
    ) {
        $this->analyticsSearch = $analyticsSearch;
        $this->cloudflareElasticClient = $cloudflareElasticClient;
        $this->analyticsTopContributors = $analyticsTopContributors;
        $this->analyticsMostUsedProposalCategories = $analyticsMostUsedProposalCategories;
        $this->projectRepository = $projectRepository;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
            $stopwatch,
            $enableCache
        );
    }

    public function invalidate(): void
    {
        $this->invalidateAll();
    }

    public function all(array $keys)
    {
        $filters = $keys[0];
        list($start, $end, $projectId, $requestedFields, $topContributorsCount) = [
            new \DateTime($filters['startAt']),
            new \DateTime($filters['endAt']),
            GlobalId::fromGlobalId($filters['projectId'])['id'],
            $filters['requestedFields'],
            $filters['topContributorsCount'],
        ];
        $projectSlug = null;
        if ($projectId) {
            /** @var $project Project */
            if (!($project = $this->projectRepository->find($projectId))) {
                throw new UserError('This project id does not exist.');
            }
            $projectSlug = $project->getSlug();
            // We avoid getting a too wide time range by setting
            // the start date to the project's publication date
            // if the given start date is smaller.
            $projectPublicationDate = $project->getPublishedAt();
            if ($projectPublicationDate && $start < $project->getPublishedAt()) {
                $start = $projectPublicationDate;
            }
        }

        // Prefill the results array with empty
        // arrays to prevent useless processing.
        $results = array_fill_keys($requestedFields, null);
        $internalAnalyticKeys = [
            'registrations',
            'votes',
            'comments',
            'contributions',
            'followers',
            'contributors',
            'topContributors',
            'anonymousContributors',
            'mostUsedProposalCategories',
        ];
        $externalAnalyticKeys = ['visitors', 'pageViews', 'mostVisitedPages'];

        // Before triggering each multi search query, we check if we need to by
        // the intersection of the requested fields and those available in the queries
        if (
            !empty(array_intersect($requestedFields, $internalAnalyticKeys)) &&
            ($internalSets = $this->analyticsSearch->getInternalAnalyticsResultSet(
                $start,
                $end,
                $topContributorsCount,
                $requestedFields,
                $projectId
            ))
        ) {
            $sets = $internalSets->getResultSets();
            $results = array_merge($results, [
                'registrations' => isset($sets['registrations'])
                    ? AnalyticsRegistrations::fromEs($sets['registrations'])
                    : [],
                'votes' => isset($sets['votes']) ? AnalyticsVotes::fromEs($sets['votes']) : [],
                'comments' => isset($sets['comments'])
                    ? AnalyticsComments::fromEs($sets['comments'])
                    : [],
                'contributions' => isset($sets['contributions'])
                    ? AnalyticsContributions::fromEs($sets['contributions'])
                    : [],
                'followers' => isset($sets['followers'])
                    ? AnalyticsFollowers::fromEs($sets['followers'])
                    : [],
                'contributors' => isset($sets['contributors'])
                    ? AnalyticsContributors::fromEs($sets['contributors'])
                    : [],
                'topContributors' => isset($sets['topContributors'])
                    ? $this->analyticsTopContributors
                        ->fromEs($sets['topContributors'])
                        ->getContributors()
                    : [],
                'anonymousContributors' => isset($sets['anonymousContributors'])
                    ? AnalyticsAnonymousContributors::fromEs($sets['anonymousContributors'])
                    : [],
                'mostUsedProposalCategories' => isset($sets['mostUsedProposalCategories'])
                    ? $this->analyticsMostUsedProposalCategories->fromEs(
                        $sets['mostUsedProposalCategories']
                    )
                    : [],
            ]);
        }

        if (
            $externalSets = $this->cloudflareElasticClient->getExternalAnalyticsResultSet(
                $start,
                $end,
                $projectSlug
            )
        ) {
            $sets = $externalSets->getResultSets();
            $results = array_merge($results, [
                'visitors' => isset($sets['visitors'])
                    ? AnalyticsVisitors::fromEs($sets['visitors'])
                    : [],
                'pageViews' => isset($sets['pageViews'])
                    ? AnalyticsPageViews::fromEs($sets['pageViews'])
                    : [],
                'mostVisitedPages' => isset($sets['mostVisitedPages'])
                    ? AnalyticsMostVisitedPages::fromEs($sets['mostVisitedPages'])
                    : [],
            ]);
        }

        if (
            \in_array('trafficSources', $requestedFields, true) &&
            ($trafficSources = $this->cloudflareElasticClient->getTrafficSourcesAnalyticsResultSet(
                $start,
                $end,
                $projectSlug
            ))
        ) {
            $results['trafficSources'] = AnalyticsTrafficSources::fromEs($trafficSources);
        }

        return $this->getPromiseAdapter()->createAll([$results]);
    }

    protected function serializeKey($key): array
    {
        return [
            'startAt' => (new \DateTime($key['startAt']))->format(DateTimeInterface::ATOM),
            'endAt' => (new \DateTime($key['endAt']))->format(DateTimeInterface::ATOM),
            'projectId' => $key['projectId'],
            'requestedFields' => $key['requestedFields'],
            'topContributorsCount' => $key['topContributorsCount'],
        ];
    }
}
