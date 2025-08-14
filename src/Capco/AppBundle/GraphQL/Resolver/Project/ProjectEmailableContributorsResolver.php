<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\ResultSetMapping;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectEmailableContributorsResolver implements QueryInterface
{
    use ResolverTrait;

    private const SQL_FILTER_PROJECT = 'WHERE project_id = :projectId ';
    private const SQL_FILTER_USER = 'WHERE u.confirmation_token IS NULL AND consent_internal_communication = :consent ';
    private const SQL_SELECT_USER = 'SELECT u.username, u.email, project_abstractstep.project_id, null as token ';
    private const SQL_FROM_PAS = 'FROM project_abstractstep ';
    private const SQL_JOIN_STEP =
        self::SQL_FROM_PAS . 'JOIN step ON step.id = project_abstractstep.step_id ';
    private const SQL_JOIN_CONSULTATION =
        self::SQL_JOIN_STEP . 'JOIN consultation ON consultation.step_id = step.id ';
    private const SQL_JOIN_OPINION =
        self::SQL_JOIN_CONSULTATION .
        'JOIN opinion ON opinion.consultation_id = consultation.id ';
    private const SQL_JOIN_PROPOSAL_FORM =
        self::SQL_JOIN_STEP . 'JOIN proposal_form ON proposal_form.step_id = step.id ';
    private const SQL_JOIN_PROPOSAL =
        self::SQL_JOIN_PROPOSAL_FORM .
        'JOIN proposal ON proposal.proposal_form_id = proposal_form.id ';
    private const SQL_JOIN_DEBATE =
        self::SQL_JOIN_STEP . 'JOIN debate ON debate.step_id = step.id ';

    private const SQL_CONTRIBUTORS_REPLY =
        "SELECT IFNULL(u.username, p.username) AS username, IFNULL(u.email, p.email) AS email, pas.project_id, null as token
        FROM project_abstractstep pas
        JOIN step s on s.id = pas.step_id
        JOIN questionnaire q on q.step_id = s.id
        JOIN reply r on r.questionnaire_id = q.id
        LEFT JOIN fos_user u ON r.author_id = u.id
        LEFT JOIN participant p ON r.participant_id = p.id
        WHERE pas.project_id = :projectId AND r.completion_status = 'COMPLETED'
        AND (u.confirmation_token IS NULL OR p.confirmation_token IS NULL)
        AND (u.consent_internal_communication = :consent OR p.consent_internal_communication = :consent)";

    private const SQL_CONTRIBUTORS_OPINION =
        self::SQL_SELECT_USER .
        self::SQL_JOIN_OPINION .
        'JOIN fos_user u ON u.id = opinion.author_id ' .
        self::SQL_FILTER_USER;
    private const SQL_CONTRIBUTORS_ARGUMENT =
        self::SQL_SELECT_USER .
        self::SQL_JOIN_OPINION .
        'JOIN argument ON argument.opinion_id = opinion.id ' .
        'JOIN fos_user u ON u.id = argument.author_id ' .
        self::SQL_FILTER_USER;
    private const SQL_CONTRIBUTORS_SOURCE =
        self::SQL_SELECT_USER .
        self::SQL_JOIN_OPINION .
        'JOIN source ON source.opinion_id = opinion.id ' .
        'JOIN fos_user u ON u.id = source.author_id ' .
        self::SQL_FILTER_USER;
    private const SQL_CONTRIBUTORS_PROPOSAL =
        self::SQL_SELECT_USER .
        self::SQL_JOIN_PROPOSAL .
        'JOIN fos_user u ON u.id = proposal.author_id ' .
        self::SQL_FILTER_USER;
    private const SQL_CONTRIBUTORS_COMMENT =
        self::SQL_SELECT_USER .
        self::SQL_JOIN_PROPOSAL .
        'JOIN comment ON comment.proposal_id = proposal.id ' .
        'JOIN fos_user u ON u.id = comment.author_id ' .
        self::SQL_FILTER_USER;
    private const SQL_CONTRIBUTORS_DEBATE_ARGUMENT =
        self::SQL_SELECT_USER .
        self::SQL_JOIN_DEBATE .
        'JOIN debate_argument ON debate_argument.debate_id = debate.id ' .
        'JOIN fos_user u ON u.id = debate_argument.author_id ' .
        self::SQL_FILTER_USER;
    private const SQL_CONTRIBUTORS_DEBATE_VOTE =
        self::SQL_SELECT_USER .
        self::SQL_JOIN_DEBATE .
        'JOIN votes ON votes.debate_id = debate.id ' .
        'JOIN fos_user u ON u.id = votes.voter_id ' .
        self::SQL_FILTER_USER;
    private const SQL_ANONYMOUS_DEBATE_ARGUMENT =
        'SELECT null as username, email, project_abstractstep.project_id, token ' .
        self::SQL_JOIN_DEBATE .
        'JOIN debate_anonymous_argument ON debate_anonymous_argument.debate_id = debate.id ' .
        'WHERE consent_internal_communication = :consent ';
    private const SQL_COLLECT_STEP_VOTES =
        "SELECT IFNULL(u.username, p.username) AS username, IFNULL(u.email, p.email) AS email, pas.project_id, null as token
        FROM project_abstractstep pas
        JOIN step s on s.id = pas.step_id
        JOIN votes v ON v.collect_step_id = pas.step_id
        LEFT JOIN fos_user u ON v.voter_id = u.id
        LEFT JOIN participant p ON v.participant_id = p.id
        WHERE pas.project_id = :projectId
        AND (v.completion_status = 'COMPLETED' AND v.is_accounted = 1)
        AND (u.confirmation_token IS NULL OR p.confirmation_token IS NULL)
        AND (u.consent_internal_communication = :consent OR p.consent_internal_communication = :consent)";

    private const SQL_SELECTION_STEP_VOTES =
        "SELECT IFNULL(u.username, p.username) AS username, IFNULL(u.email, p.email) AS email, pas.project_id, null as token
        FROM project_abstractstep pas
        JOIN step s on s.id = pas.step_id
        JOIN votes v ON v.selection_step_id = pas.step_id
        LEFT JOIN fos_user u ON v.voter_id = u.id
        LEFT JOIN participant p ON v.participant_id = p.id
        WHERE pas.project_id = :projectId
        AND (v.completion_status = 'COMPLETED' AND v.is_accounted = 1)
        AND (u.confirmation_token IS NULL OR p.confirmation_token IS NULL)
        AND (u.consent_internal_communication = :consent OR p.consent_internal_communication = :consent)";

    private const SQL_UNION =
        '(' .
        self::SQL_CONTRIBUTORS_REPLY .
        'UNION ' .
        self::SQL_CONTRIBUTORS_OPINION .
        'UNION ' .
        self::SQL_CONTRIBUTORS_ARGUMENT .
        'UNION ' .
        self::SQL_CONTRIBUTORS_SOURCE .
        'UNION ' .
        self::SQL_CONTRIBUTORS_PROPOSAL .
        'UNION ' .
        self::SQL_CONTRIBUTORS_COMMENT .
        'UNION ' .
        self::SQL_CONTRIBUTORS_DEBATE_ARGUMENT .
        'UNION ' .
        self::SQL_CONTRIBUTORS_DEBATE_VOTE .
        'UNION ' .
        self::SQL_ANONYMOUS_DEBATE_ARGUMENT .
        'UNION ' .
        self::SQL_COLLECT_STEP_VOTES .
        'UNION ' .
        self::SQL_SELECTION_STEP_VOTES .
        ')';

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    public function __invoke(Project $project, Argument $argument): ConnectionInterface
    {
        $paginator = new Paginator(fn (?int $offset, ?int $limit) => $this->getContributors($project, $limit, $offset));
        $connection = $paginator->auto($argument, $this->getTotalCount($project));
        $connection->{'refusingCount'} = $this->getRefusingCount($project);

        return $connection;
    }

    public function getContributors(Project $project, ?int $limit, ?int $offset): array
    {
        $sql =
            'SELECT DISTINCT username, email, token FROM ' .
            self::SQL_UNION .
            ' AS U ' .
            self::SQL_FILTER_PROJECT .
            'ORDER BY email ASC ';
        if ($limit) {
            $sql .= 'LIMIT :limit ';
        }
        if ($offset) {
            $sql .= 'OFFSET :offset ';
        }

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('email', 'email');
        $rsm->addScalarResult('username', 'username');
        $rsm->addScalarResult('token', 'token');
        $query = $this->em->createNativeQuery($sql, $rsm);
        $query->setParameter('projectId', $project->getId());
        $query->setParameter('consent', 1);
        if ($limit) {
            $query->setParameter('limit', $limit);
        }
        if ($offset) {
            $query->setParameter('offset', $offset);
        }

        return $query->getArrayResult();
    }

    private function getTotalCount(Project $project): int
    {
        return $this->getCount($project, true);
    }

    private function getRefusingCount(Project $project): int
    {
        return $this->getCount($project, false);
    }

    private function getCount(Project $project, bool $consent): int
    {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('count', 'count');
        $sql =
            'SELECT COUNT(DISTINCT email) AS count FROM ' .
            self::SQL_UNION .
            ' AS U ' .
            self::SQL_FILTER_PROJECT;
        $query = $this->em->createNativeQuery($sql, $rsm);
        $query->setParameter('projectId', $project->getId());
        $query->setParameter('consent', $consent ? 1 : 0);

        return $query->getSingleScalarResult();
    }
}
