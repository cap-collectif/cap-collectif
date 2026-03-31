<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;

class SelectionStepContributorSearch
{
    private const USER_CONTRIBUTOR_TYPE = 'user';

    public function __construct(
        private readonly Connection $connection,
        private readonly UserRepository $userRepository,
        private readonly ParticipantRepository $participantRepository
    ) {
    }

    /**
     * Reuses ElasticsearchPaginatedResult because StepContributorResolver still paginates
     * through ElasticsearchPaginator, which expects entities, cursors and totalCount.
     */
    public function findContributors(
        SelectionStep $step,
        int $limit,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $offset = $this->getOffset($cursor);
        $queryLimit = 0 === $limit ? 1 : $limit;
        /** @var array<int, array{contributor_type: ?string, contributor_id: ?string, total_count: int|string}> $rows */
        $rows = $this->connection->fetchAllAssociative(
            <<<'SQL'
                SELECT
                    contributors.contributor_type,
                    contributors.contributor_id,
                    COUNT(*) OVER() AS total_count
                FROM (
                    SELECT
                        0 AS source_priority,
                        'user' AS contributor_type,
                        user.id AS contributor_id,
                        COUNT(DISTINCT vote.id) AS votes_count,
                        user.created_at AS created_at,
                        NULL AS participant_sort_id
                    FROM votes vote
                    INNER JOIN fos_user user ON user.id = vote.voter_id
                    INNER JOIN proposal proposal ON proposal.id = vote.proposal_id
                    WHERE vote.selection_step_id = :stepId
                      AND vote.voteType = 'proposalSelection'
                      AND vote.published = 1
                      AND vote.completion_status = 'COMPLETED'
                      AND (vote.is_created_before_workflow = 1 OR vote.is_accounted = 1)
                      AND user.confirmation_token IS NULL
                      AND proposal.deleted_at IS NULL
                      AND proposal.trashed_at IS NULL
                      AND proposal.is_draft = 0
                      AND proposal.published = 1
                    GROUP BY user.id, user.created_at

                    UNION ALL

                    SELECT
                        1 AS source_priority,
                        'participant' AS contributor_type,
                        participant.id AS contributor_id,
                        0 AS votes_count,
                        NULL AS created_at,
                        participant.id AS participant_sort_id
                    FROM votes vote
                    INNER JOIN participant participant ON participant.id = vote.participant_id
                    INNER JOIN proposal proposal ON proposal.id = vote.proposal_id
                    WHERE vote.selection_step_id = :stepId
                      AND vote.voteType = 'proposalSelection'
                      AND vote.published = 1
                      AND vote.completion_status = 'COMPLETED'
                      AND (vote.is_created_before_workflow = 1 OR vote.is_accounted = 1)
                      AND proposal.deleted_at IS NULL
                      AND proposal.trashed_at IS NULL
                      AND proposal.is_draft = 0
                      AND proposal.published = 1
                    GROUP BY participant.id
                ) contributors
                ORDER BY
                    contributors.source_priority ASC,
                    contributors.votes_count DESC,
                    contributors.created_at DESC,
                    contributors.participant_sort_id ASC,
                    contributors.contributor_id ASC
                LIMIT :limit OFFSET :offset
                SQL,
            [
                'stepId' => $step->getId(),
                'limit' => $queryLimit,
                'offset' => $offset,
            ],
            [
                'limit' => ParameterType::INTEGER,
                'offset' => ParameterType::INTEGER,
            ]
        );

        $totalCount = [] !== $rows ? (int) $rows[0]['total_count'] : 0;
        $contributors = $this->hydrateRows($rows);

        if (0 === $limit) {
            return new ElasticsearchPaginatedResult([], [], $totalCount);
        }

        return new ElasticsearchPaginatedResult(
            $contributors,
            $this->buildCursors($offset, \count($rows)),
            $totalCount
        );
    }

    /**
     * @param array<int, array{contributor_type: ?string, contributor_id: ?string, total_count: int|string}> $rows
     *
     * @return array<int, Participant|User>
     */
    private function hydrateRows(array $rows): array
    {
        $userIds = [];
        $participantIds = [];

        foreach ($rows as $row) {
            if (null === $row['contributor_id']) {
                continue;
            }

            if (self::USER_CONTRIBUTOR_TYPE === $row['contributor_type']) {
                $userIds[] = $row['contributor_id'];
            } else {
                $participantIds[] = $row['contributor_id'];
            }
        }

        $usersById = $this->indexById($this->userRepository->hydrateFromIdsOrdered($userIds));
        $participantsById = $this->indexById($this->participantRepository->hydrateFromIdsOrdered($participantIds));

        $contributors = [];

        foreach ($rows as $row) {
            if (self::USER_CONTRIBUTOR_TYPE === $row['contributor_type']) {
                $contributor = $usersById[$row['contributor_id']] ?? null;
            } else {
                $contributor = $participantsById[$row['contributor_id']] ?? null;
            }

            // just in case some users/participants got deleted during the process
            if (null !== $contributor) {
                $contributors[] = $contributor;
            }
        }

        return $contributors;
    }

    /**
     * @param array<int, Participant|User> $contributors
     *
     * @return array<string, Participant|User>
     */
    private function indexById(array $contributors): array
    {
        if ([] === $contributors) {
            return [];
        }

        $contributorsById = [];

        foreach ($contributors as $contributor) {
            $contributorsById[$contributor->getId()] = $contributor;
        }

        return $contributorsById;
    }

    /**
     * @return array<int, array{0: int}>
     */
    private function buildCursors(int $offset, int $count): array
    {
        $cursors = [];

        for ($index = 0; $index < $count; ++$index) {
            $cursors[] = [$offset + $index];
        }

        return $cursors;
    }

    private function getOffset(?string $cursor): int
    {
        if (null === $cursor) {
            return 0;
        }

        $decodedCursor = ElasticsearchPaginator::decodeCursor($cursor);

        return (int) ($decodedCursor[0] ?? -1) + 1;
    }
}
