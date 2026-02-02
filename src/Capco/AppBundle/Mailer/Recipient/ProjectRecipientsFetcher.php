<?php

namespace Capco\AppBundle\Mailer\Recipient;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query\ResultSetMapping;

/**
 * Do NOT factorize NOR re-indent the query string functions getXxxxxSQL(), they wouldn't be readable.
 * Also, for developer comfort, we need IDE database autocompletion.
 */
class ProjectRecipientsFetcher
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /**
     * @throws Exception
     *
     * @return array<int, array<string, ?string>>
     */
    public function getRecipientDataByProject(
        Project $project,
        ?int $offset = null,
        ?int $limit = null,
    ): array {
        $sql =
            'SELECT DISTINCT id, username, email, token, locale, type FROM ' . $this->getUnionSQLForProject();

        if (null !== $limit && $limit > 0) {
            $sql .= ' LIMIT ' . $limit;
        }

        if (null !== $offset && $offset > 0) {
            $sql .= ' OFFSET ' . $offset;
        }

        return $this->em->getConnection()->fetchAllAssociative(
            $sql,
            [
                'projectId' => $project->getId(),
                'consent' => 1,
                'userType' => RecipientType::User->value,
                'participantType' => RecipientType::Participant->value,
            ]
        );
    }

    /**
     * @throws Exception
     *
     * @return array<int, array<string, ?string>>
     */
    public function getRecipientsByEmailingCampaign(
        EmailingCampaign $emailingCampaign,
        ?int $limit = null,
    ): array {
        $sql =
            'SELECT id, username, email, token, locale, type ' .
            'FROM ' . $this->getUnionSQLForEmailingCampaign();

        if (null !== $limit && $limit > 0) {
            $sql .= ' LIMIT ' . $limit;
        }

        return $this->em->getConnection()->fetchAllAssociative(
            $sql,
            [
                'projectId' => $emailingCampaign->getProject()->getId(),
                'consent' => 1,
                'userType' => RecipientType::User->value,
                'participantType' => RecipientType::Participant->value,
                'emailingCampaign' => $emailingCampaign->getId(),
            ]
        );
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function getTotalCountByProject(Project $project): int
    {
        return $this->getCountByProject($project, true);
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function getRefusingCountByProject(Project $project): int
    {
        return $this->getCountByProject($project, false);
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    private function getCountByProject(Project $project, bool $consent): int
    {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('count', 'count');
        $sql =
            'SELECT COUNT(DISTINCT email) AS count FROM ' . $this->getUnionSQLForProject();

        $query = $this->em->createNativeQuery($sql, $rsm)
            ->setParameters([
                'projectId' => $project->getId(),
                'consent' => $consent ? 1 : 0,
                'userType' => RecipientType::User->value,
                'participantType' => RecipientType::Participant->value,
            ])
        ;

        return (int) $query->getSingleScalarResult();
    }

    private function getUnionSQLForProject(): string
    {
        $sql = '(';

        $sql .= implode(
            separator: ' UNION ',
            array: [
                $this->getUserReplySQL(false),
                $this->getParticipantReplySQL(false),
                $this->getOpinionSQL(false),
                $this->getArgumentSQL(false),
                $this->getSourceSQL(false),
                $this->getProposalSQL(false),
                $this->getCommentSQL(false),
                $this->getDebateArgumentSQL(false),
                $this->getDebateVoteSQL(false),
                $this->getUserOpinionVoteSQL(false),
                $this->getParticipantOpinionVoteSQL(false),
                $this->getAnonymousDebateArgumentSQL(),
                $this->getUserCollectStepVotesSQL(false),
                $this->getParticipantCollectStepVotesSQL(false),
                $this->getUserSelectionStepVotesSQL(false),
                $this->getParticipantSelectionStepVotesSQL(false),
            ]
        );

        $sql .= ') AS U WHERE project_id = :projectId ORDER BY email';

        return $sql;
    }

    /**
     * This version of the SQL is MUCH faster due to :
     * - NOT ordering
     * - NOT removing duplicates (using UNION ALL).
     *
     * We don't need the order in the emailing campaign use case,
     * and we remove duplicates in PHP.
     */
    private function getUnionSQLForEmailingCampaign(): string
    {
        $sql = '(';

        $sql .= implode(
            separator: ' UNION ALL ',
            array: [
                $this->getUserReplySQL(true),
                $this->getParticipantReplySQL(true),
                $this->getOpinionSQL(true),
                $this->getArgumentSQL(true),
                $this->getSourceSQL(true),
                $this->getProposalSQL(true),
                $this->getCommentSQL(true),
                $this->getDebateArgumentSQL(true),
                $this->getDebateVoteSQL(true),
                $this->getUserOpinionVoteSQL(true),
                $this->getParticipantOpinionVoteSQL(true),
                $this->getAnonymousDebateArgumentSQL(),
                $this->getUserCollectStepVotesSQL(true),
                $this->getParticipantCollectStepVotesSQL(true),
                $this->getUserSelectionStepVotesSQL(true),
                $this->getParticipantSelectionStepVotesSQL(true),
            ]
        );

        $sql .= ') AS U WHERE project_id = :projectId ';

        return $sql;
    }

    private function getUserReplySQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                pas.project_id,
                null as token,
                :userType AS type
            FROM
                project_abstractstep pas
                INNER JOIN step s on s.id = pas.step_id
                INNER JOIN questionnaire q on q.step_id = s.id
                INNER JOIN reply r on r.questionnaire_id = q.id
                INNER JOIN fos_user u ON r.author_id = u.id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= "
            WHERE
                pas.project_id = :projectId
                AND r.completion_status = 'COMPLETED'
                AND u.confirmation_token IS NULL
                AND u.consent_internal_communication = :consent";

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getParticipantReplySQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                p.id,
                p.username ,
                p.email,
                p.locale,
                pas.project_id,
                p.token as token,
                :participantType AS type
            FROM
                project_abstractstep pas
                INNER JOIN step s on s.id = pas.step_id
                INNER JOIN questionnaire q on q.step_id = s.id
                INNER JOIN reply r on r.questionnaire_id = q.id
                INNER JOIN participant p ON r.participant_id = p.id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnParticipant();
        }

        $sql .= "
            WHERE
                pas.project_id = :projectId
                AND r.completion_status = 'COMPLETED'
                AND p.confirmation_token IS NULL
                AND p.consent_internal_communication = :consent";

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getOpinionSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                project_abstractstep.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN consultation ON consultation.step_id = step.id
                INNER JOIN opinion ON opinion.consultation_id = consultation.id
                INNER JOIN fos_user u ON u.id = opinion.author_id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= '
            WHERE
                u.confirmation_token IS NULL
                AND consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getArgumentSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                project_abstractstep.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN consultation ON consultation.step_id = step.id
                INNER JOIN opinion ON opinion.consultation_id = consultation.id
                INNER JOIN argument ON argument.opinion_id = opinion.id
                INNER JOIN fos_user u ON u.id = argument.author_id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= '
            WHERE
                u.confirmation_token IS NULL
                AND consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getSourceSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                project_abstractstep.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN consultation ON consultation.step_id = step.id
                INNER JOIN opinion ON opinion.consultation_id = consultation.id
                INNER JOIN source ON source.opinion_id = opinion.id
                INNER JOIN fos_user u ON u.id = source.author_id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= '
            WHERE
                u.confirmation_token IS NULL
                AND consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getProposalSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                project_abstractstep.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN proposal_form ON proposal_form.step_id = step.id
                INNER JOIN proposal ON proposal.proposal_form_id = proposal_form.id
                INNER JOIN fos_user u ON u.id = proposal.author_id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= '
            WHERE
                u.confirmation_token IS NULL
                AND consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getCommentSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                project_abstractstep.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN proposal_form ON proposal_form.step_id = step.id
                INNER JOIN proposal ON proposal.proposal_form_id = proposal_form.id
                INNER JOIN comment ON comment.proposal_id = proposal.id
                INNER JOIN fos_user u ON u.id = comment.author_id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= '
            WHERE
                u.confirmation_token IS NULL
                AND consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getDebateArgumentSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                project_abstractstep.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN debate ON debate.step_id = step.id
                INNER JOIN debate_argument ON debate_argument.debate_id = debate.id
                INNER JOIN fos_user u ON u.id = debate_argument.author_id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= '
            WHERE
                u.confirmation_token IS NULL
                AND consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getDebateVoteSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                project_abstractstep.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN debate ON debate.step_id = step.id
                INNER JOIN votes ON votes.debate_id = debate.id
                INNER JOIN fos_user u ON u.id = votes.voter_id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= '
            WHERE
                u.confirmation_token IS NULL
                AND consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getUserOpinionVoteSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                project_abstractstep.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN consultation ON consultation.step_id = step.id
                INNER JOIN opinion ON opinion.consultation_id = consultation.id
                INNER JOIN votes ON votes.opinion_id = opinion.id
                INNER JOIN fos_user u ON u.id = votes.voter_id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= '
            WHERE
                u.confirmation_token IS NULL
                AND u.consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getParticipantOpinionVoteSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                p.id,
                p.username,
                p.email,
                p.locale,
                project_abstractstep.project_id,
                p.token as token,
                :participantType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN consultation ON consultation.step_id = step.id
                INNER JOIN opinion ON opinion.consultation_id = consultation.id
                INNER JOIN votes ON votes.opinion_id = opinion.id
                INNER JOIN participant p ON votes.participant_id = p.id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnParticipant();
        }

        $sql .= '
            WHERE
                p.confirmation_token IS NULL
                AND p.consent_internal_communication = :consent';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    /**
     * This case is different from all the others because it's the legacy anonymous participation.
     * We don't have a User or Participant entity, just an email and a token.
     * It is still flagged as Participant Type because it's what it should be after refactoring.
     */
    private function getAnonymousDebateArgumentSQL(): string
    {
        return
            'SELECT
                null AS id,
                null AS username,
                email,
                null AS locale,
                project_abstractstep.project_id,
                token,
                :participantType AS type
            FROM
                project_abstractstep
                INNER JOIN step ON step.id = project_abstractstep.step_id
                INNER JOIN debate ON debate.step_id = step.id
                INNER JOIN debate_anonymous_argument ON debate_anonymous_argument.debate_id = debate.id
            WHERE
                consent_internal_communication = :consent';
    }

    private function getUserCollectStepVotesSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                pas.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep pas
                INNER JOIN step s ON s.id = pas.step_id
                INNER JOIN votes v ON v.collect_step_id = pas.step_id
                INNER JOIN fos_user u ON v.voter_id = u.id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= "
            WHERE
                pas.project_id = :projectId
                AND v.completion_status = 'COMPLETED'
                AND v.is_accounted = 1
                AND u.confirmation_token IS NULL
                AND u.consent_internal_communication = :consent";

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getParticipantCollectStepVotesSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                p.id,
                p.username,
                p.email,
                p.locale,
                pas.project_id,
                p.token as token,
                :participantType AS type
            FROM
                project_abstractstep pas
                INNER JOIN step s ON s.id = pas.step_id
                INNER JOIN votes v ON v.collect_step_id = pas.step_id
                INNER JOIN participant p ON v.participant_id = p.id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnParticipant();
        }

        $sql .= "
            WHERE
                pas.project_id = :projectId
                AND v.completion_status = 'COMPLETED'
                AND v.is_accounted = 1
                AND p.confirmation_token IS NULL
                AND p.consent_internal_communication = :consent";

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getUserSelectionStepVotesSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                u.id,
                u.username,
                u.email,
                u.locale,
                pas.project_id,
                null AS token,
                :userType AS type
            FROM
                project_abstractstep pas
                INNER JOIN step s ON s.id = pas.step_id
                INNER JOIN votes v ON v.selection_step_id = pas.step_id
                INNER JOIN fos_user u ON v.voter_id = u.id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnUser();
        }

        $sql .= "
            WHERE
                pas.project_id = :projectId
                AND v.completion_status = 'COMPLETED'
                AND v.is_accounted = 1
                AND u.confirmation_token IS NULL
                AND u.consent_internal_communication = :consent";

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function getParticipantSelectionStepVotesSQL(bool $checkEmailingCampaignUser): string
    {
        $sql =
            'SELECT
                p.id,
                p.username,
                p.email,
                p.locale,
                pas.project_id,
                p.token as token,
                :participantType AS type
            FROM
                project_abstractstep pas
                INNER JOIN step s ON s.id = pas.step_id
                INNER JOIN votes v ON v.selection_step_id = pas.step_id
                INNER JOIN participant p ON v.participant_id = p.id';

        if ($checkEmailingCampaignUser) {
            $sql .= $this->leftJoinEmailingCampaignUserOnParticipant();
        }

        $sql .= "
            WHERE
                pas.project_id = :projectId
                AND v.completion_status = 'COMPLETED'
                AND v.is_accounted = 1
                AND p.confirmation_token IS NULL
                AND p.consent_internal_communication = :consent";

        if ($checkEmailingCampaignUser) {
            $sql .= $this->emailingCampaignUserWhereClause();
        }

        return $sql;
    }

    private function leftJoinEmailingCampaignUserOnUser(): string
    {
        return ' LEFT JOIN emailing_campaign_user ecu ON ecu.emailing_campaign_id = :emailingCampaign AND ecu.user_id = u.id ';
    }

    private function leftJoinEmailingCampaignUserOnParticipant(): string
    {
        return ' LEFT JOIN emailing_campaign_user ecu ON ecu.emailing_campaign_id = :emailingCampaign AND ecu.participant_id = p.id ';
    }

    private function emailingCampaignUserWhereClause(): string
    {
        return ' AND ecu.id IS NULL ';
    }
}
