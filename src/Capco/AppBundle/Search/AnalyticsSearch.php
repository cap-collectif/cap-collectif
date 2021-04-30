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
        DateTimeInterface $end
    ): \Elastica\Multi\ResultSet {
        $multiSearchQuery = new Search($this->getClient());

        $multiSearchQuery->addSearches([
            'registrations' => $this->createUserRegistrationsQuery($start, $end),
            'contributors' => $this->createContributorsQuery($start, $end),
            'votes' => $this->createVotesQuery($start, $end),
            'comments' => $this->createCommentsQuery($start, $end),
            'contributions' => $this->createContributionsQuery($start, $end),
            'followers' => $this->createFollowersQuery($start, $end),
            'topContributors' => $this->createTopContributorsQuery($start, $end),
            'mostUsedProposalCategories' => $this->createMostUsedProposalCategoriesQuery(
                $start,
                $end
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

    public function getVotesResultSet(DateTimeInterface $start, DateTimeInterface $end): ResultSet
    {
        return $this->createVotesQuery($start, $end)->search();
    }

    public function getCommentsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): ResultSet {
        return $this->createCommentsQuery($start, $end)->search();
    }

    public function getContributionsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): ResultSet {
        return $this->createContributionsQuery($start, $end)->search();
    }

    public function getFollowersResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): ResultSet {
        return $this->createFollowersQuery($start, $end)->search();
    }

    public function getMostActiveContributorsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): ResultSet {
        return $this->createTopContributorsQuery($start, $end)->search();
    }

    public function getMostUsedProposalCategoriesResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): ResultSet {
        return $this->createMostUsedProposalCategoriesQuery($start, $end)->search();
    }

    public function getParticipantsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): ResultSet {
        return $this->createContributorsQuery($start, $end)->search();
    }

    private function getClient(): Client
    {
        return $this->index->getClient();
    }

    private function createUserRegistrationsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): \Elastica\Search {
        return $this->createAggregatedQuery(['user'], 'registrations', $start, $end);
    }

    private function createVotesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): \Elastica\Search {
        return $this->createAggregatedQuery(['vote', 'debateAnonymousVote'], 'votes', $start, $end);
    }

    private function createCommentsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): \Elastica\Search {
        return $this->createAggregatedQuery(['comment'], 'comments', $start, $end);
    }

    private function createContributionsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): \Elastica\Search {
        return $this->createAggregatedQuery(
            self::CONTRIBUTION_TYPES,
            'contributions',
            $start,
            $end
        );
    }

    private function createFollowersQuery(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): \Elastica\Search {
        return $this->createAggregatedQuery(['follower'], 'followers', $start, $end, 'followedAt');
    }

    private function createTopContributorsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): \Elastica\Search {
        $boolQuery = new BoolQuery();
        $boolQuery->addFilter(new Query\Term(['published' => true]))->addFilter(
            new Range('createdAt', [
                'gte' => $start->format(DateTimeInterface::ATOM),
                'lte' => $end->format(DateTimeInterface::ATOM),
            ])
        );
        $this->addContributionsFilters($boolQuery);
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
        string $aggregatedField = 'createdAt',
        string $interval = 'month'
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

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(new DateHistogram($aggregationName, $aggregatedField, $interval));

        return $this->index->createSearch($query);
    }

    private function createMostUsedProposalCategoriesQuery(
        DateTimeInterface $start,
        DateTimeInterface $end
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
        DateTimeInterface $end
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

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                (new DateHistogram(
                    'participations_per_interval',
                    'createdAt',
                    'month'
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
            new Query\Terms('objectType', array_merge(self::CONTRIBUTION_TYPES, ['vote']))
        );

        return $boolQuery;
    }
}
