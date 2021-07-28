<?php

namespace Capco\AppBundle\Search;

use DateTimeInterface;
use Elastica\Aggregation\Cardinality;
use Elastica\Aggregation\DateHistogram;
use Elastica\Aggregation\Terms;
use Elastica\Client;
use Elastica\Index;
use Elastica\Multi\Search;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Range;
use Elastica\ResultSet;

class AnalyticsSearch
{
    private const CONTRIBUTION_TYPES = [
        'reply',
        'proposal',
        'comment',
        'opinion',
        'opinionVersion',
        'argument',
        'debateArgument',
        'source',
    ];

    private Index $index;

    public function __construct(Index $index)
    {
        $this->index = $index;
    }

    public function getInternalAnalyticsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Multi\ResultSet {
        $multiSearchQuery = new Search($this->getClient());

        $multiSearchQuery->addSearches([
            'registrations' => $this->createUserRegistrationsQuery($start, $end),
            'contributors' => $this->createContributorsQuery($start, $end, $projectId),
            'votes' => $this->createVotesQuery($start, $end, $projectId),
            'comments' => $this->createCommentsQuery($start, $end, $projectId),
            'contributions' => $this->createContributionsQuery($start, $end, $projectId),
            'followers' => $this->createFollowersQuery($start, $end, $projectId),
            'topContributors' => $this->createTopContributorsQuery($start, $end, $projectId),
            'mostUsedProposalCategories' => $this->createMostUsedProposalCategoriesQuery(
                $start,
                $end,
                $projectId
            ),
        ]);

        return $multiSearchQuery->search();
    }

    public function getUserRegistrationsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): ResultSet {
        return $this->createUserRegistrationsQuery($start, $end)->search();
    }

    public function getVotesResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): ResultSet {
        return $this->createVotesQuery($start, $end, $projectId)->search();
    }

    public function getCommentsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): ResultSet {
        return $this->createCommentsQuery($start, $end, $projectId)->search();
    }

    public function getContributionsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): ResultSet {
        return $this->createContributionsQuery($start, $end, $projectId)->search();
    }

    public function getFollowersResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): ResultSet {
        return $this->createFollowersQuery($start, $end, $projectId)->search();
    }

    public function getMostActiveContributorsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): ResultSet {
        return $this->createTopContributorsQuery($start, $end, $projectId)->search();
    }

    public function getMostUsedProposalCategoriesResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): ResultSet {
        return $this->createMostUsedProposalCategoriesQuery($start, $end, $projectId)->search();
    }

    public function getParticipantsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): ResultSet {
        return $this->createContributorsQuery($start, $end, $projectId)->search();
    }

    private function getClient(): Client
    {
        return $this->index->getClient();
    }

    private function createUserRegistrationsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): \Elastica\Search {
        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter(new Query\Terms('objectType', ['user']))
            ->addFilter(
                new Range('createdAt', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['enabled' => true]));

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                new DateHistogram(
                    'registrations',
                    'createdAt',
                    $this->getDateHistogramInterval($start, $end)
                )
            );

        return $this->index->createSearch($query);
    }

    private function createVotesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter(new Query\Terms('objectType', ['vote', 'debateAnonymousVote']))
            ->addFilter(
                new Range('createdAt', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]));

        if ($projectId) {
            $boolQuery->addFilter(
                new Query\Term([
                    'project.id' => ['value' => $projectId],
                ])
            );
        }

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                new DateHistogram(
                    'votes',
                    'createdAt',
                    $this->getDateHistogramInterval($start, $end)
                )
            );

        return $this->index->createSearch($query);
    }

    private function createCommentsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter(new Query\Terms('objectType', ['comment']))
            ->addFilter(
                new Range('createdAt', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]));

        if ($projectId) {
            $boolQuery->addFilter(
                (new BoolQuery())->addShould([
                    (new BoolQuery())
                        ->addMustNot(new Query\Exists('project'))
                        ->addFilter(new Query\Term(['event.projects.id' => $projectId])),
                    (new BoolQuery())
                        ->addMustNot(new Query\Exists('project'))
                        ->addFilter(new Query\Term(['proposal.project.id' => $projectId])),
                ])
            );
        }

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                new DateHistogram(
                    'comments',
                    'createdAt',
                    $this->getDateHistogramInterval($start, $end)
                )
            );

        return $this->index->createSearch($query);
    }

    private function createContributionsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        return $this->createAggregatedQuery(
            self::CONTRIBUTION_TYPES,
            'contributions',
            $start,
            $end,
            $projectId
        );
    }

    private function createFollowersQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter(new Query\Terms('objectType', ['follower']))
            ->addFilter(
                new Range('followedAt', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]));

        if ($projectId) {
            $boolQuery->addFilter(
                (new BoolQuery())->addShould([
                    new Query\Term(['opinion.project.id' => $projectId]),
                    new Query\Term(['opinionVersion.project.id' => $projectId]),
                    new Query\Term(['proposal.project.id' => $projectId]),
                ])
            );
        }

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                new DateHistogram(
                    'followers',
                    'followedAt',
                    $this->getDateHistogramInterval($start, $end)
                )
            );

        return $this->index->createSearch($query);
    }

    private function createTopContributorsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        $boolQuery = new BoolQuery();
        $boolQuery->addFilter(new Query\Term(['published' => true]))->addFilter(
            new Range('createdAt', [
                'gte' => $start->format(DateTimeInterface::ATOM),
                'lte' => $end->format(DateTimeInterface::ATOM),
            ])
        );
        if ($projectId) {
            $boolQuery->addFilter(new Query\Term(['project.id' => $projectId]));
        }

        $this->addContributionsFilters($boolQuery);
        $this->addProjectFilters($boolQuery, $projectId);
        $query = new Query($boolQuery);
        $query
            ->addAggregation(
                (new Terms('author'))
                    ->setField('author.id')
                    ->setOrder('_count', 'desc')
                    ->addAggregation(
                        (new Terms('objectType'))
                            ->setField('objectType')
                            ->setOrder('_count', 'desc')
                            ->setSize(10)
                    )
            )
            ->setSize(0);

        return $this->index->createSearch($query);
    }

    private function createAggregatedQuery(
        array $objectTypes,
        string $aggregationName,
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null,
        string $aggregatedField = 'createdAt'
    ): \Elastica\Search {
        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter(new Query\Terms('objectType', $objectTypes))
            ->addFilter(
                new Range($aggregatedField, [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]));

        $this->addProjectFilters($boolQuery, $projectId);

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                new DateHistogram(
                    $aggregationName,
                    $aggregatedField,
                    $this->getDateHistogramInterval($start, $end)
                )
            );

        return $this->index->createSearch($query);
    }

    private function createMostUsedProposalCategoriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(new Query\Term(['objectType' => 'proposal']))
            ->addFilter(
                new Range('createdAt', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]));

        if ($projectId) {
            $boolQuery->addFilter(new Query\Term(['project.id' => $projectId]));
        }

        $query = new Query($boolQuery);
        $query
            ->setSize(0)
            ->setTrackTotalHits(true)
            ->addAggregation(
                (new Terms('most_used_proposal_categories'))
                    ->setField('category.id')
                    ->setOrder('_count', 'desc')
                    ->setSize(5)
            );

        return $this->index->createSearch($query);
    }

    private function createContributorsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(
                new Range('createdAt', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lte' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]));
        $this->addContributionsAndVotesFilters($boolQuery);

        $this->addProjectFilters($boolQuery, $projectId);

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                (new DateHistogram(
                    'participations_per_interval',
                    'createdAt',
                    $this->getDateHistogramInterval($start, $end)
                ))->addAggregation(
                    (new Cardinality('participants_per_interval'))->setField('author.id')
                )
            )
            ->addAggregation((new Cardinality('participants'))->setField('author.id'));

        return $this->index->createSearch($query);
    }

    private function addContributionsFilters(BoolQuery $boolQuery): BoolQuery
    {
        $boolQuery->addFilter(new Query\Terms('objectType', self::CONTRIBUTION_TYPES));

        return $boolQuery;
    }

    private function addContributionsAndVotesFilters(BoolQuery $boolQuery): BoolQuery
    {
        $boolQuery->addFilter(
            new Query\Terms(
                'objectType',
                array_merge(self::CONTRIBUTION_TYPES, ['vote', 'debateAnonymousVote'])
            )
        );

        return $boolQuery;
    }

    private function addProjectFilters(BoolQuery $boolQuery, ?string $projectId = null): BoolQuery
    {
        if ($projectId) {
            $boolQuery->addFilter(
                (new BoolQuery())->addShould([
                    (new BoolQuery())
                        ->addMustNot(new Query\Exists('project'))
                        ->addFilter(new Query\Term(['event.projects.id' => $projectId])),
                    (new BoolQuery())
                        ->addMustNot(new Query\Exists('project'))
                        ->addFilter(new Query\Term(['proposal.project.id' => $projectId])),
                    (new BoolQuery())
                        ->addFilter(new Query\Exists('project'))
                        ->addFilter(new Query\Term(['project.id' => $projectId])),
                ])
            );
        }

        return $boolQuery;
    }

    private function getDateHistogramInterval(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): string {
        $daysDiff = $start->diff($end)->days;
        $dateHistogramInterval = 'day';
        // 2 months
        if ($daysDiff > 60) {
            $dateHistogramInterval = 'month';
        }

        return $dateHistogramInterval;
    }
}
