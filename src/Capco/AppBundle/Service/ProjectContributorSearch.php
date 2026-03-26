<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\UserOrderField;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ProjectContributorSearch
{
    private const USER_CONTRIBUTOR_TYPE = 'user';
    private const PARTICIPANT_CONTRIBUTOR_TYPE = 'participant';

    public function __construct(
        private readonly Connection $connection,
        private readonly UserRepository $userRepository,
        private readonly ParticipantRepository $participantRepository,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
    ) {
    }

    /**
     * Reuses ElasticsearchPaginatedResult because ProjectContributorResolver still paginates
     * through ElasticsearchPaginator, which expects entities, cursors and totalCount.
     *
     * @param array{
     *     step?: ?string,
     *     vip?: ?bool,
     *     userType?: ?string,
     *     term?: ?string,
     *     emailConfirmed?: ?bool,
     *     consentInternalCommunication?: ?bool
     * } $providedFilters
     * @param array{field?: string, direction?: string} $orderBy
     */
    public function findContributors(
        Project $project,
        array $providedFilters,
        array $orderBy,
        int $limit,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $offset = $this->getOffset($cursor);
        $queryLimit = 0 === $limit ? 1 : $limit;
        $query = $this->buildQuery($providedFilters, $orderBy);

        /** @var array<int, array{contributor_type: string, contributor_id: string, total_count: int|string}> $rows */
        $rows = $this->connection->fetchAllAssociative(
            $query,
            $this->buildParameters($project, $providedFilters, $queryLimit, $offset),
            $this->buildTypes()
        );

        $totalCount = [] !== $rows ? (int) $rows[0]['total_count'] : 0;
        if (0 === $limit) {
            return new ElasticsearchPaginatedResult([], [], $totalCount);
        }

        return new ElasticsearchPaginatedResult(
            $this->hydrateRows($rows),
            $this->buildCursors($offset, \count($rows)),
            $totalCount
        );
    }

    /**
     * @param array<int, array{contributor_type: string, contributor_id: string, total_count: int|string}> $rows
     *
     * @return array<int, Participant|User>
     */
    private function hydrateRows(array $rows): array
    {
        $userIds = [];
        $participantIds = [];

        foreach ($rows as $row) {
            if (self::USER_CONTRIBUTOR_TYPE === $row['contributor_type']) {
                $userIds[] = $row['contributor_id'];

                continue;
            }

            $participantIds[] = $row['contributor_id'];
        }

        $usersById = $this->indexById($this->userRepository->hydrateFromIdsOrdered($userIds));
        $participantsById = $this->indexById($this->participantRepository->hydrateFromIdsOrdered($participantIds));

        $contributors = [];
        foreach ($rows as $row) {
            $contributor = self::USER_CONTRIBUTOR_TYPE === $row['contributor_type']
                ? ($usersById[$row['contributor_id']] ?? null)
                : ($participantsById[$row['contributor_id']] ?? null);

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

    /**
     * @param array{
     *     step?: ?string,
     *     vip?: ?bool,
     *     userType?: ?string,
     *     term?: ?string,
     *     emailConfirmed?: ?bool,
     *     consentInternalCommunication?: ?bool
     * } $providedFilters
     * @param array{field?: string, direction?: string} $orderBy
     */
    private function buildQuery(array $providedFilters, array $orderBy): string
    {
        $filters = ['aggregated.project_id = :projectId'];
        $contributionFilters = [];

        if (isset($providedFilters['step'])) {
            $contributionFilters[] = 'contributions.step_id = :stepId';
        }

        if (isset($providedFilters['term']) && '' !== $providedFilters['term']) {
            $termFilters = [
                'aggregated.username LIKE :term',
                'aggregated.firstname LIKE :term',
                'aggregated.lastname LIKE :term',
                'aggregated.participant_email LIKE :term',
            ];

            if ($this->authorizationChecker->isGranted('ROLE_ADMIN')) {
                $termFilters[] = 'aggregated.user_email LIKE :term';
            }

            $filters[] = '(' . implode(' OR ', $termFilters) . ')';
        }

        if (isset($providedFilters['vip'])) {
            $filters[] = sprintf(
                "(aggregated.contributor_type = '%s' OR aggregated.vip = :vip)",
                self::PARTICIPANT_CONTRIBUTOR_TYPE
            );
        }

        if (isset($providedFilters['userType'])) {
            $filters[] = sprintf(
                "(aggregated.contributor_type = '%s' OR aggregated.user_type_id = :userTypeId)",
                self::PARTICIPANT_CONTRIBUTOR_TYPE
            );
        }

        if (isset($providedFilters['emailConfirmed']) && $providedFilters['emailConfirmed']) {
            $filters[] = sprintf(
                "(aggregated.contributor_type = '%s' OR aggregated.email_confirmed = :emailConfirmed)",
                self::PARTICIPANT_CONTRIBUTOR_TYPE
            );
        }

        if (
            isset($providedFilters['consentInternalCommunication'])
            && $providedFilters['consentInternalCommunication']
        ) {
            $filters[] = sprintf(
                "(aggregated.contributor_type = '%s' OR aggregated.consent_internal_communication = :consentInternalCommunication)",
                self::PARTICIPANT_CONTRIBUTOR_TYPE
            );
        }

        $orderDirection = 'DESC';
        if (isset($orderBy['direction']) && 'ASC' === strtoupper((string) $orderBy['direction'])) {
            $orderDirection = 'ASC';
        }

        $orderSql = UserOrderField::ACTIVITY === ($orderBy['field'] ?? null)
            ? "aggregated.source_priority ASC, aggregated.activity_count {$orderDirection}, aggregated.contributor_id ASC"
            : "aggregated.source_priority ASC, aggregated.created_at {$orderDirection}, aggregated.participant_sort_id ASC, aggregated.contributor_id ASC";

        return sprintf(
            <<<'SQL'
                SELECT
                    aggregated.contributor_type,
                    aggregated.contributor_id,
                    COUNT(*) OVER() AS total_count
                FROM (
                    SELECT
                        contributions.contributor_type,
                        contributions.contributor_id,
                        MIN(contributions.source_priority) AS source_priority,
                        MAX(contributions.project_id) AS project_id,
                        MAX(contributions.step_id) AS step_id,
                        COUNT(*) AS activity_count,
                        MAX(contributions.created_at) AS created_at,
                        MAX(contributions.participant_sort_id) AS participant_sort_id,
                        MAX(contributions.username) AS username,
                        MAX(contributions.firstname) AS firstname,
                        MAX(contributions.lastname) AS lastname,
                        MAX(contributions.user_email) AS user_email,
                        MAX(contributions.participant_email) AS participant_email,
                        MAX(contributions.vip) AS vip,
                        MAX(contributions.user_type_id) AS user_type_id,
                        MAX(contributions.email_confirmed) AS email_confirmed,
                        MAX(contributions.consent_internal_communication) AS consent_internal_communication
                    FROM (
                        %s
                    ) contributions
                    %s
                    GROUP BY contributions.contributor_type, contributions.contributor_id
                ) aggregated
                WHERE %s
                ORDER BY %s
                LIMIT :limit OFFSET :offset
                SQL,
            $this->getUnionSQL(),
            [] !== $contributionFilters ? 'WHERE ' . implode(' AND ', $contributionFilters) : '',
            implode(' AND ', $filters),
            $orderSql
        );
    }

    /**
     * @param array{
     *     step?: ?string,
     *     vip?: ?bool,
     *     userType?: ?string,
     *     term?: ?string,
     *     emailConfirmed?: ?bool,
     *     consentInternalCommunication?: ?bool
     * } $providedFilters
     *
     * @return array<string, bool|int|string>
     */
    private function buildParameters(Project $project, array $providedFilters, int $limit, int $offset): array
    {
        $parameters = [
            'projectId' => $project->getId(),
            'limit' => $limit,
            'offset' => $offset,
        ];

        if (isset($providedFilters['step'])) {
            $parameters['stepId'] = $providedFilters['step'];
        }

        if (isset($providedFilters['term']) && '' !== $providedFilters['term']) {
            $parameters['term'] = '%' . $providedFilters['term'] . '%';
        }

        if (isset($providedFilters['vip'])) {
            $parameters['vip'] = (int) $providedFilters['vip'];
        }

        if (isset($providedFilters['userType'])) {
            $parameters['userTypeId'] = $providedFilters['userType'];
        }

        if (isset($providedFilters['emailConfirmed']) && $providedFilters['emailConfirmed']) {
            $parameters['emailConfirmed'] = (int) $providedFilters['emailConfirmed'];
        }

        if (
            isset($providedFilters['consentInternalCommunication'])
            && $providedFilters['consentInternalCommunication']
        ) {
            $parameters['consentInternalCommunication'] = (int) $providedFilters['consentInternalCommunication'];
        }

        return $parameters;
    }

    /**
     * @return array<string, int|ParameterType|string>
     */
    private function buildTypes(): array
    {
        return [
            'limit' => ParameterType::INTEGER,
            'offset' => ParameterType::INTEGER,
        ];
    }

    private function getUnionSQL(): string
    {
        return implode(
            ' UNION ALL ',
            [
                $this->getUserReplySQL(),
                $this->getParticipantReplySQL(),
                $this->getOpinionSQL(),
                $this->getOpinionVersionSQL(),
                $this->getArgumentSQL(),
                $this->getArgumentOpinionVersionSQL(),
                $this->getSourceSQL(),
                $this->getSourceOpinionVersionSQL(),
                $this->getProposalSQL(),
                $this->getDebateArgumentSQL(),
                $this->getDebateVoteSQL(),
                $this->getUserOpinionVoteSQL(),
                $this->getUserOpinionVersionVoteSQL(),
                $this->getUserArgumentVoteSQL(),
                $this->getUserSourceVoteSQL(),
                $this->getUserCollectStepVotesSQL(),
                $this->getParticipantCollectStepVotesSQL(),
                $this->getUserSelectionStepVotesSQL(),
                $this->getParticipantSelectionStepVotesSQL(),
                $this->getUserDebateArgumentVoteSQL(),
                $this->getUserDebateAnonymousArgumentVoteSQL(),
            ]
        );
    }

    private function getUserReplySQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN questionnaire q ON q.step_id = s.id
            INNER JOIN reply r ON r.questionnaire_id = q.id
            INNER JOIN fos_user u ON r.author_id = u.id
            WHERE pas.project_id = :projectId
              AND r.published = 1
              AND r.is_draft = 0
              AND r.completion_status != 'MISSING_REQUIREMENTS'
            SQL;
    }

    private function getParticipantReplySQL(): string
    {
        return <<<'SQL'
            SELECT
                1 AS source_priority,
                'participant' AS contributor_type,
                p.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                p.created_at AS created_at,
                p.id AS participant_sort_id,
                p.username AS username,
                p.firstname AS firstname,
                p.lastname AS lastname,
                NULL AS user_email,
                p.email AS participant_email,
                NULL AS vip,
                NULL AS user_type_id,
                CASE WHEN p.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                p.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN questionnaire q ON q.step_id = s.id
            INNER JOIN reply r ON r.questionnaire_id = q.id
            INNER JOIN participant p ON r.participant_id = p.id
            WHERE pas.project_id = :projectId
              AND r.completion_status = 'COMPLETED'
            SQL;
    }

    private function getOpinionSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN fos_user u ON u.id = o.author_id
            WHERE pas.project_id = :projectId
              AND o.published = 1
            SQL;
    }

    private function getOpinionVersionSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN opinion_version ov ON ov.opinion_id = o.id
            INNER JOIN fos_user u ON u.id = ov.author_id
            WHERE pas.project_id = :projectId
              AND ov.published = 1
              AND o.published = 1
            SQL;
    }

    private function getArgumentSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN argument a ON a.opinion_id = o.id
            INNER JOIN fos_user u ON u.id = a.author_id
            WHERE pas.project_id = :projectId
              AND a.published = 1
              AND o.published = 1
            SQL;
    }

    private function getArgumentOpinionVersionSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN opinion_version ov ON ov.opinion_id = o.id
            INNER JOIN argument a ON a.opinion_version_id = ov.id
            INNER JOIN fos_user u ON u.id = a.author_id
            WHERE pas.project_id = :projectId
              AND a.published = 1
              AND ov.published = 1
              AND o.published = 1
            SQL;
    }

    private function getSourceSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN source src ON src.opinion_id = o.id
            INNER JOIN fos_user u ON u.id = src.author_id
            WHERE pas.project_id = :projectId
              AND src.published = 1
              AND o.published = 1
            SQL;
    }

    private function getSourceOpinionVersionSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN opinion_version ov ON ov.opinion_id = o.id
            INNER JOIN source src ON src.opinion_version_id = ov.id
            INNER JOIN fos_user u ON u.id = src.author_id
            WHERE pas.project_id = :projectId
              AND src.published = 1
              AND ov.published = 1
              AND o.published = 1
            SQL;
    }

    private function getProposalSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN proposal_form pf ON pf.step_id = s.id
            INNER JOIN proposal pr ON pr.proposal_form_id = pf.id
            INNER JOIN fos_user u ON u.id = pr.author_id
            WHERE pas.project_id = :projectId
              AND pr.published = 1
              AND pr.is_draft = 0
              AND pr.deleted_at IS NULL
            SQL;
    }

    private function getDebateArgumentSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN debate d ON d.step_id = s.id
            INNER JOIN debate_argument da ON da.debate_id = d.id
            INNER JOIN fos_user u ON u.id = da.author_id
            WHERE pas.project_id = :projectId
              AND da.published = 1
            SQL;
    }

    private function getDebateVoteSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN debate d ON d.step_id = s.id
            INNER JOIN votes v ON v.debate_id = d.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'debate'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
            SQL;
    }

    private function getUserOpinionVoteSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN votes v ON v.opinion_id = o.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'opinion'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
              AND o.published = 1
            SQL;
    }

    private function getUserOpinionVersionVoteSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN opinion_version ov ON ov.opinion_id = o.id
            INNER JOIN votes v ON v.opinion_version_id = ov.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'opinionVersion'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
              AND ov.published = 1
              AND o.published = 1
            SQL;
    }

    private function getUserArgumentVoteSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN argument a ON a.opinion_id = o.id
            INNER JOIN votes v ON v.argument_id = a.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'argument'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
              AND a.published = 1
              AND o.published = 1
            UNION ALL
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN opinion_version ov ON ov.opinion_id = o.id
            INNER JOIN argument a ON a.opinion_version_id = ov.id
            INNER JOIN votes v ON v.argument_id = a.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'argument'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
              AND a.published = 1
              AND ov.published = 1
              AND o.published = 1
            SQL;
    }

    private function getUserSourceVoteSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN source src ON src.opinion_id = o.id
            INNER JOIN votes v ON v.source_id = src.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'source'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
              AND src.published = 1
              AND o.published = 1
            UNION ALL
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN consultation c ON c.step_id = s.id
            INNER JOIN opinion o ON o.consultation_id = c.id
            INNER JOIN opinion_version ov ON ov.opinion_id = o.id
            INNER JOIN source src ON src.opinion_version_id = ov.id
            INNER JOIN votes v ON v.source_id = src.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'source'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
              AND src.published = 1
              AND ov.published = 1
              AND o.published = 1
            SQL;
    }

    private function getUserCollectStepVotesSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN votes v ON v.collect_step_id = pas.step_id
            INNER JOIN fos_user u ON v.voter_id = u.id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'proposalCollect'
              AND v.published = 1
              AND v.completion_status != 'MISSING_REQUIREMENTS'
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
            SQL;
    }

    private function getParticipantCollectStepVotesSQL(): string
    {
        return <<<'SQL'
            SELECT
                1 AS source_priority,
                'participant' AS contributor_type,
                p.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                p.created_at AS created_at,
                p.id AS participant_sort_id,
                p.username AS username,
                p.firstname AS firstname,
                p.lastname AS lastname,
                NULL AS user_email,
                p.email AS participant_email,
                NULL AS vip,
                NULL AS user_type_id,
                CASE WHEN p.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                p.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN votes v ON v.collect_step_id = pas.step_id
            INNER JOIN participant p ON v.participant_id = p.id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'proposalCollect'
              AND v.completion_status = 'COMPLETED'
              AND v.is_accounted = 1
            SQL;
    }

    private function getUserSelectionStepVotesSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN votes v ON v.selection_step_id = pas.step_id
            INNER JOIN fos_user u ON v.voter_id = u.id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'proposalSelection'
              AND v.published = 1
              AND v.completion_status != 'MISSING_REQUIREMENTS'
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
            SQL;
    }

    private function getParticipantSelectionStepVotesSQL(): string
    {
        return <<<'SQL'
            SELECT
                1 AS source_priority,
                'participant' AS contributor_type,
                p.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                p.created_at AS created_at,
                p.id AS participant_sort_id,
                p.username AS username,
                p.firstname AS firstname,
                p.lastname AS lastname,
                NULL AS user_email,
                p.email AS participant_email,
                NULL AS vip,
                NULL AS user_type_id,
                CASE WHEN p.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                p.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN votes v ON v.selection_step_id = pas.step_id
            INNER JOIN participant p ON v.participant_id = p.id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'proposalSelection'
              AND v.completion_status = 'COMPLETED'
              AND v.is_accounted = 1
            SQL;
    }

    private function getUserDebateArgumentVoteSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN debate d ON d.step_id = s.id
            INNER JOIN debate_argument da ON da.debate_id = d.id
            INNER JOIN votes v ON v.debate_argument_id = da.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'debateArgument'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
              AND da.published = 1
            SQL;
    }

    private function getUserDebateAnonymousArgumentVoteSQL(): string
    {
        return <<<'SQL'
            SELECT
                0 AS source_priority,
                'user' AS contributor_type,
                u.id AS contributor_id,
                pas.project_id AS project_id,
                s.id AS step_id,
                u.created_at AS created_at,
                NULL AS participant_sort_id,
                u.username AS username,
                u.firstname AS firstname,
                u.lastname AS lastname,
                u.email AS user_email,
                NULL AS participant_email,
                u.vip AS vip,
                u.user_type_id AS user_type_id,
                CASE WHEN u.confirmation_token IS NULL THEN 1 ELSE 0 END AS email_confirmed,
                u.consent_internal_communication AS consent_internal_communication
            FROM project_abstractstep pas
            INNER JOIN step s ON s.id = pas.step_id
            INNER JOIN debate d ON d.step_id = s.id
            INNER JOIN debate_anonymous_argument daa ON daa.debate_id = d.id
            INNER JOIN votes v ON v.debate_anonymous_argument_id = daa.id
            INNER JOIN fos_user u ON u.id = v.voter_id
            WHERE pas.project_id = :projectId
              AND v.voteType = 'debateAnonymousArgument'
              AND v.published = 1
              AND (v.is_created_before_workflow = 1 OR (v.is_created_before_workflow = 0 AND v.is_accounted = 1))
            SQL;
    }
}
