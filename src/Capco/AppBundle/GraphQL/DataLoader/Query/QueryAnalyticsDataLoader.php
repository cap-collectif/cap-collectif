<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Query;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Client\CloudflareElasticClient;
use Capco\AppBundle\DataCollector\GraphQLCollector;
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
        list($start, $end, $projectId, $topContributorsCount) = [
            new \DateTime($filters['startAt']),
            new \DateTime($filters['endAt']),
            GlobalId::fromGlobalId($filters['projectId'])['id'],
            $filters['topContributorsCount'],
        ];
        $projectSlug = null;
        if ($projectId) {
            /** @var $project Project */
            if (!($project = $this->projectRepository->find($projectId))) {
                throw new UserError('This project id doest not exist.');
            }
            $projectSlug = $project->getSlug();
            // We avoid getting a too wide time range by setting the start date to the project's publication date
            // if the given start date is smaller.
            $projectPublicationDate = $project->getPublishedAt();
            if ($projectPublicationDate && $start < $project->getPublishedAt()) {
                $start = $projectPublicationDate;
            }
        }
        $internalSets = $this->analyticsSearch
            ->getInternalAnalyticsResultSet($start, $end, $topContributorsCount, $projectId)
            ->getResultSets();
        $externalSets = $this->cloudflareElasticClient
            ->getExternalAnalyticsResultSet($start, $end, $projectSlug)
            ->getResultSets();
        $trafficSources = $this->cloudflareElasticClient->getTrafficSourcesAnalyticsResultSet(
            $start,
            $end,
            $projectSlug
        );

        $result = [
            'registrations' => AnalyticsRegistrations::fromEs($internalSets['registrations']),
            'votes' => AnalyticsVotes::fromEs($internalSets['votes']),
            'comments' => AnalyticsComments::fromEs($internalSets['comments']),
            'contributions' => AnalyticsContributions::fromEs($internalSets['contributions']),
            'followers' => AnalyticsFollowers::fromEs($internalSets['followers']),
            'contributors' => AnalyticsContributors::fromEs($internalSets['contributors']),
            'topContributors' => $this->analyticsTopContributors->fromEs(
                $internalSets['topContributors']
            ),
            'visitors' => AnalyticsVisitors::fromEs($externalSets['visitors']),
            'pageViews' => AnalyticsPageViews::fromEs($externalSets['pageViews']),
            'mostVisitedPages' => AnalyticsMostVisitedPages::fromEs(
                $externalSets['mostVisitedPages']
            ),
            'mostUsedProposalCategories' => $this->analyticsMostUsedProposalCategories->fromEs(
                $internalSets['mostUsedProposalCategories']
            ),
            'trafficSources' => AnalyticsTrafficSources::fromEs($trafficSources),
        ];

        return $this->getPromiseAdapter()->createAll([$result]);
    }

    protected function serializeKey($key): array
    {
        return [
            'startAt' => (new \DateTime($key['startAt']))->format(DateTimeInterface::ATOM),
            'endAt' => (new \DateTime($key['startAt']))->format(DateTimeInterface::ATOM),
            'projectId' => $key['projectId'],
            'topContributorsCount' => $key['topContributorsCount'],
        ];
    }
}
