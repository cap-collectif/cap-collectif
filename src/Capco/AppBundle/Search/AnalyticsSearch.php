<?php

namespace Capco\AppBundle\Search;

use Capco\AdminBundle\Timezone\GlobalConfigurationTimeZoneDetector;
use DateTimeInterface;
use Elastica\Aggregation\Cardinality;
use Elastica\Aggregation\DateHistogram;
use Elastica\Aggregation\Terms;
use Elastica\Client;
use Elastica\Exception\Connection\HttpException;
use Elastica\Index;
use Elastica\Multi\Search;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Range;
use Elastica\ResultSet;
use Psr\Log\LoggerInterface;

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
        'debateAnonymousArgument',
        'source',
    ];

    public function __construct(private readonly Index $index, private readonly LoggerInterface $logger, private readonly GlobalConfigurationTimeZoneDetector $timezoneDetector)
    {
    }

    public function getInternalAnalyticsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        int $topContributorsCount,
        array $requestedFields,
        ?string $projectId = null
    ): \Elastica\Multi\ResultSet {
        $multiSearchQuery = new Search($this->getClient());
        $searchQueries = [
            'registrations' => $this->createUserRegistrationsQuery($start, $end),
            'contributors' => $this->createContributorsQuery($start, $end, $projectId),
            'votes' => $this->createVotesQuery($start, $end, $projectId),
            'comments' => $this->createCommentsQuery($start, $end, $projectId),
            'contributions' => $this->createContributionsQuery($start, $end, $projectId),
            'followers' => $this->createFollowersQuery($start, $end, $projectId),
            'topContributors' => $this->createTopContributorsQuery(
                $start,
                $end,
                $topContributorsCount,
                $projectId
            ),
            'anonymousContributors' => $this->createAnonymousContributorsQuery(
                $start,
                $end,
                $projectId
            ),
            'mostUsedProposalCategories' => $this->createMostUsedProposalCategoriesQuery(
                $start,
                $end,
                $projectId
            ),
        ];

        $searches = $this->unsetNonRequestedSearchQueries($searchQueries, $requestedFields);
        $multiSearchQuery->addSearches($searches);

        try {
            $searchResult = $multiSearchQuery->search();
        } catch (HttpException) {
            $searchResult = null;
            $this->logger->error('Internal analytics multi search query timed out.', [
                'requested_fields' => $requestedFields,
                'project_id' => $projectId,
                'date_interval' => compact($start, $end),
            ]);
        }

        return $searchResult;
    }

    public function getAnonymousContributorsResultSet(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): ResultSet {
        return $this->createAnonymousContributorsQuery($start, $end, $projectId)->search();
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

    public function createAnonymousContributorsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        // the object should either be debateAnonymousVote or an anonymous reply
        $objectTypeBoolQuery = new BoolQuery();
        $objectTypeBoolQuery->addShould(new Query\Term(['objectType' => 'debateAnonymousVote']));
        $objectTypeBoolQuery->addShould(
            (new BoolQuery())
                ->addFilter(new Query\Term(['objectType' => 'reply']))
                ->addFilter(new Query\Term(['replyType' => 'replyAnonymous']))
        );
        $objectTypeBoolQuery->addShould((new BoolQuery())
            ->addFilter(new Query\Term(['objectType' => 'vote']))
            ->addFilter(new Query\Term(['voteTypeName' => 'proposalCollectSmsVote'])));
        $objectTypeBoolQuery->addShould((new BoolQuery())
            ->addFilter(new Query\Term(['objectType' => 'vote']))
            ->addFilter(new Query\Term(['voteTypeName' => 'proposalSelectionSmsVote'])));

        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter($objectTypeBoolQuery)
            ->addFilter(
                new Range('createdAt', [
                    'gte' => $start->format(DateTimeInterface::ATOM),
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]))
        ;
        $this->addProjectFilters($boolQuery, $projectId);

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                $this->addDateHistogram('anonymous_participations_per_interval', 'createdAt', $start, $end)
                    ->addAggregation(
                        (new Cardinality('anonymous_participants_per_interval'))->setField('ipAddress')
                    )
            )
            ->addAggregation((new Cardinality('anonymous_participants'))->setField('ipAddress'))
        ;

        return $this->index->createSearch($query);
    }

    public function addDateHistogram(string $name, string $field, DateTimeInterface $start, DateTimeInterface $end): DateHistogram
    {
        return (new DateHistogram(
            $name,
            $field,
            $this->getDateHistogramInterval($start, $end)
        ))
            ->setParam('min_doc_count', 0)
            ->setParam('extended_bounds', [
                'min' => $start->format('Y-m-d\TH:i'),
                'max' => $end->format('Y-m-d\TH:i'),
            ])
            ->setTimezone($this->timezoneDetector->getTimezone())
        ;
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
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['enabled' => true]))
        ;

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation($this->addDateHistogram('registrations', 'createdAt', $start, $end))
        ;

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
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]))
            ->addFilter(new Query\Term(['isAccounted' => true]))
        ;

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
            ->addAggregation($this->addDateHistogram('votes', 'createdAt', $start, $end))
        ;

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
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]))
        ;

        if ($projectId) {
            $boolQuery->addFilter(
                (new BoolQuery())
                    ->addShould(
                        (new BoolQuery())
                            ->addMustNot(new Query\Exists('project'))
                            ->addFilter(new Query\Term(['event.projects.id' => $projectId]))
                    )
                    ->addShould(
                        (new BoolQuery())
                            ->addMustNot(new Query\Exists('project'))
                            ->addFilter(new Query\Term(['proposal.project.id' => $projectId]))
                    )
            );
        }

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                $this->addDateHistogram('comments', 'createdAt', $start, $end)
            )
        ;

        return $this->index->createSearch($query);
    }

    private function createContributionsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        ?string $projectId = null
    ): \Elastica\Search {
        // Does not include comments, since the comments are separately computed
        $objectTypes = [
            'reply',
            'proposal',
            'opinion',
            'opinionVersion',
            'argument',
            'debateArgument',
            'debateAnonymousArgument',
            'source',
        ];

        return $this->createAggregatedQuery(
            $objectTypes,
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
        $boolQuery->addFilter(new Query\Term(['objectType' => 'follower']))->addFilter(
            new Range('followedAt', [
                'gte' => $start->format(DateTimeInterface::ATOM),
                'lt' => $end->format(DateTimeInterface::ATOM),
            ])
        );

        if ($projectId) {
            $boolQuery->addFilter(
                (new BoolQuery())
                    ->addShould(new Query\Term(['opinion.project.id' => $projectId]))
                    ->addShould(new Query\Term(['opinionVersion.project.id' => $projectId]))
                    ->addShould(new Query\Term(['proposal.project.id' => $projectId]))
            );
        }

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation($this->addDateHistogram('followers', 'followedAt', $start, $end))
        ;

        return $this->index->createSearch($query);
    }

    private function createTopContributorsQuery(
        DateTimeInterface $start,
        DateTimeInterface $end,
        int $topContributorsCount,
        ?string $projectId = null
    ): \Elastica\Search {
        $boolQuery = new BoolQuery();
        $boolQuery->addFilter(new Query\Term(['published' => true]))->addFilter(
            new Range('createdAt', [
                'gte' => $start->format(DateTimeInterface::ATOM),
                'lt' => $end->format(DateTimeInterface::ATOM),
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
                    ->setSize($topContributorsCount)
                    ->addAggregation(
                        (new Terms('objectType'))
                            ->setField('objectType')
                            ->setOrder('_count', 'desc')
                            ->setSize(2)
                    )
            )
            ->setSize(0)
        ;

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
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]))
        ;

        $this->addProjectFilters($boolQuery, $projectId);

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                $this->addDateHistogram($aggregationName, $aggregatedField, $start, $end)
            )
        ;

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
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]))
        ;

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
            )
        ;

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
                    'lt' => $end->format(DateTimeInterface::ATOM),
                ])
            )
            ->addFilter(new Query\Term(['published' => true]))
        ;
        $this->addContributionsAndVotesFilters($boolQuery);

        $this->addProjectFilters($boolQuery, $projectId);

        $query = new Query($boolQuery);
        $query
            ->setTrackTotalHits(true)
            ->setSize(0)
            ->addAggregation(
                $this->addDateHistogram('participations_per_interval', 'createdAt', $start, $end)
                    ->addAggregation(
                        (new Cardinality('participants_per_interval'))->setField('author.id')
                    )
            )
            ->addAggregation((new Cardinality('participants'))->setField('author.id'))
        ;

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
                (new BoolQuery())
                    ->addShould(
                        (new BoolQuery())
                            ->addMustNot(new Query\Exists('project'))
                            ->addFilter(new Query\Term(['event.projects.id' => $projectId]))
                    )
                    ->addShould(
                        (new BoolQuery())
                            ->addMustNot(new Query\Exists('project'))
                            ->addFilter(new Query\Term(['proposal.project.id' => $projectId]))
                    )
                    ->addShould(
                        (new BoolQuery())
                            ->addFilter(new Query\Exists('project'))
                            ->addFilter(new Query\Term(['project.id' => $projectId]))
                    )
            );
        }

        return $boolQuery;
    }

    /**
     * Redefine the pitch of the date histogram to years if the difference
     * between its start date and its end date is greater than 1 year.
     *
     * It avoid getting too much data on a low pitch.
     */
    private function getDateHistogramInterval(
        DateTimeInterface $start,
        DateTimeInterface $end
    ): string {
        $daysDiff = $start->diff($end)->days;
        $dateHistogramInterval = 'day';
        if ($daysDiff > 365) {
            $dateHistogramInterval = 'month';
        }

        return $dateHistogramInterval;
    }

    private function unsetNonRequestedSearchQueries(
        array $searchQueries,
        array $requestedFields
    ): array {
        // We unset the non-requested fields before starting the request.
        $requestedFieldsDiff = array_diff(array_keys($searchQueries), $requestedFields);
        if (!empty($requestedFieldsDiff)) {
            foreach ($requestedFieldsDiff as $field) {
                unset($searchQueries[$field]);
            }
        }

        return $searchQueries;
    }
}
