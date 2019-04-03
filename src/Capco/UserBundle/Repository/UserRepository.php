<?php

namespace Capco\UserBundle\Repository;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\PublicApiToken;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class UserRepository extends EntityRepository
{
    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb
            ->addSelect('media', 'userType')
            ->leftJoin('u.media', 'media')
            ->leftJoin('u.userType', 'userType')
            ->where('u.id IN (:ids)')
            ->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    public function findUserByPublicApiKey(string $apiKey): ?User
    {
        return $this->createQueryBuilder('u')
            ->innerJoin(PublicApiToken::class, 't', Expr\Join::WITH, 't.user = u.id')
            ->where('t.value = :apiKey')
            ->setParameter('apiKey', $apiKey)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countUsersInGroup(Group $group): int
    {
        $qb = $this->createQueryBuilder('u');
        $qb
            ->select('COUNT(u.id)')
            ->innerJoin('u.userGroups', 'ug')
            ->andWhere('ug.group = :group')
            ->setParameter('group', $group);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countAllUsers(bool $showSuperAdmin = false): int
    {
        $query = $this->createQueryBuilder('user')->select('COUNT(user.id)');

        if ($showSuperAdmin) {
            $query
                ->andWhere('user.roles != :role')
                ->setParameter('role', serialize(['ROLE_SUPER_ADMIN']));
        }

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getAllUsers(
        ?int $limit = null,
        ?int $first = null,
        bool $showSuperAdmin = false
    ): Paginator {
        $qb = $this->createQueryBuilder('user');

        if ($showSuperAdmin) {
            $qb
                ->andWhere('user.roles != :role')
                ->setParameter('role', serialize(['ROLE_SUPER_ADMIN']));
        }

        if ($first) {
            $qb->setFirstResult($first);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return new Paginator($qb);
    }

    public function getUsersInGroup(Group $group): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb
            ->innerJoin('u.userGroups', 'ug')
            ->andWhere('ug.group = :group')
            ->setParameter('group', $group);

        return $qb->getQuery()->getResult();
    }

    public function getRegisteredCount(): int
    {
        // TODO why do we need DISTINCT ?
        $qb = $this->createQueryBuilder('u');
        $qb->select('count(DISTINCT u.id)');
        $qb->andWhere('u.confirmationToken IS NULL');

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function getRegisteredNotConfirmedByEmailCount(): int
    {
        // TODO why do we need DISTINCT ?
        $qb = $this->createQueryBuilder('u');
        $qb->select('count(DISTINCT u.id)');
        $qb->andWhere('u.confirmationToken IS NOT NULL');

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function getRegisteredContributorCount(): int
    {
        $qb = $this->createQueryBuilder('u');

        $qbOpinion = $this->createQueryBuilder('userOpinion');
        $qbOpinion
            ->select('userOpinion.id')
            ->innerJoin('userOpinion.opinions', 'opinion', 'WITH', 'opinion.published = true');

        $qbSource = $this->createQueryBuilder('userSource');
        $qbSource
            ->select('userSource.id')
            ->innerJoin('userSource.sources', 'source', 'WITH', 'source.published = true');

        $qbComment = $this->createQueryBuilder('userComment');
        $qbComment
            ->select('userComment.id')
            ->innerJoin('userComment.comments', 'comment', 'WITH', 'comment.published = true');

        $qbVote = $this->createQueryBuilder('userVote');
        $qbVote
            ->select('userVote.id')
            ->innerJoin('userVote.votes', 'vote', 'WITH', 'vote.published = true');

        $qbArgument = $this->createQueryBuilder('userArgument');
        $qbArgument
            ->select('userArgument.id')
            ->innerJoin('userArgument.arguments', 'argument', 'WITH', 'argument.published = true');

        $qbOpinionVersions = $this->createQueryBuilder('userOpinionVersions');
        $qbOpinionVersions
            ->select('userOpinionVersions.id')
            ->innerJoin(
                'userOpinionVersions.opinionVersions',
                'version',
                'WITH',
                'version.published = true'
            );

        $qbProposal = $this->createQueryBuilder('userProposal');
        $qbProposal
            ->select('userProposal.id')
            ->innerJoin(
                'userProposal.proposals',
                'proposal',
                'WITH',
                'proposal.published = true AND proposal.draft = false'
            );

        $qbReply = $this->createQueryBuilder('userReply');
        $qbReply
            ->select('userReply.id')
            ->innerJoin('userReply.replies', 'reply', 'WITH', 'reply.published = true');

        $qb
            ->select('count(DISTINCT u.id)')
            ->orWhere($qb->expr()->in('u.id', $qbReply->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbOpinion->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbArgument->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbProposal->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbOpinionVersions->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbVote->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbComment->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbSource->getDQL()));

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function findProjectSourceContributorsWithCount(Project $project): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct s) as sources_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Source s WITH s.author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN o.step ostep
          LEFT JOIN ostep.projectAbstractStep opas
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN ovo.step ovostep
          LEFT JOIN ovostep.projectAbstractStep ovopas
          WHERE s.published = 1 AND (
            (s.opinion IS NOT NULL AND o.published = 1 AND opas.project = :project)
            OR
            (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovopas.project = :project)
          )
          GROUP BY u.id
        '
            )
            ->setParameter('project', $project);

        return $query->getResult();
    }

    public function findProjectArgumentContributorsWithCount(Project $project): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct a) as arguments_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Argument a WITH a.Author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN o.step ostep
          LEFT JOIN ostep.projectAbstractStep opas
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN ovo.step ovostep
          LEFT JOIN ovostep.projectAbstractStep ovopas
          WHERE a.published = 1 AND (
            (a.opinion IS NOT NULL AND o.published = 1 AND opas.project = :project)
            OR
            (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovopas.project = :project)
          )
          GROUP BY u.id
        '
            )
            ->setParameter('project', $project);

        return $query->getResult();
    }

    public function findOneByEmail(string $email): ?User
    {
        $qb = $this->createQueryBuilder('u');
        $qb->andWhere('u.email = :email')->setParameter('email', $email);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function findUserByNewEmailConfirmationToken(string $token)
    {
        $qb = $this->createQueryBuilder('u');
        $qb->andWhere('u.newEmailConfirmationToken = :token')->setParameter('token', $token);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function findProjectOpinionContributorsWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions) as opinions_count')
            ->leftJoin('u.opinions', 'opinions', 'WITH', 'opinions.published = 1')
            ->leftJoin('opinions.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.projectAbstractStep', 'cas')
            ->where('cas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project);

        return $qb->getQuery()->getResult();
    }

    public function findProjectProposalContributorsWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct proposals) as proposals_count')
            ->leftJoin('u.proposals', 'proposals', 'WITH', 'proposals.published = 1')
            ->leftJoin('proposals.proposalForm', 'proposalForm')
            ->leftJoin('proposalForm.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.projectAbstractStep', 'pas')
            ->where('pas.project = :project')
            ->andWhere('proposals.draft = 0')
            ->groupBy('u.id')
            ->setParameter('project', $project);

        return $qb->getQuery()->getResult();
    }

    public function findProjectReplyContributorsWithCount(
        Project $project,
        $excludePrivate = false
    ): array {
        $replyWith = $excludePrivate
            ? '(replies.published = 1 AND replies.private = 0)'
            : 'replies.published = 1';
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct replies) as replies_count')
            ->leftJoin('u.replies', 'replies', 'WITH', $replyWith)
            ->leftJoin('replies.questionnaire', 'questionnaire')
            ->leftJoin('questionnaire.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.projectAbstractStep', 'pas')
            ->where('pas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project);

        return $qb->getQuery()->getResult();
    }

    public function findProjectVersionContributorsWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions) as versions_count')
            ->leftJoin('u.opinionVersions', 'versions', 'WITH', 'versions.published = 1')
            ->leftJoin('versions.parent', 'opinions', 'WITH', 'opinions.published = 1')
            ->leftJoin('opinions.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.projectAbstractStep', 'cas')
            ->where('cas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project);

        return $qb->getQuery()->getResult();
    }

    public function findProjectOpinionVotersWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions_votes) as opinions_votes_count')
            ->leftJoin(
                'CapcoAppBundle:OpinionVote',
                'opinions_votes',
                'WITH',
                'opinions_votes.user = u AND opinions_votes.published = 1'
            )
            ->leftJoin(
                'opinions_votes.opinion',
                'opinions_votes_opinion',
                'WITH',
                'opinions_votes_opinion.published = 1'
            )
            ->leftJoin(
                'opinions_votes_opinion.step',
                'opinions_votes_opinion_step',
                'WITH',
                'opinions_votes_opinion_step.isEnabled = 1'
            )
            ->leftJoin('opinions_votes_opinion_step.projectAbstractStep', 'cas')
            ->where('cas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project);

        return $qb->getQuery()->getResult();
    }

    public function findProjectVersionVotersWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions_votes) as versions_votes_count')
            ->leftJoin(
                'CapcoAppBundle:OpinionVersionVote',
                'versions_votes',
                'WITH',
                'versions_votes.user = u AND versions_votes.published = 1'
            )
            ->leftJoin(
                'versions_votes.opinionVersion',
                'versions_votes_version',
                'WITH',
                'versions_votes_version.published = 1'
            )
            ->leftJoin(
                'versions_votes_version.parent',
                'versions_votes_version_parent',
                'WITH',
                'versions_votes_version_parent.published = 1'
            )
            ->leftJoin(
                'versions_votes_version_parent.step',
                'versions_votes_version_step',
                'WITH',
                'versions_votes_version_step.isEnabled = 1'
            )
            ->leftJoin('versions_votes_version_step.projectAbstractStep', 'cas')
            ->where('cas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project);

        return $qb->getQuery()->getResult();
    }

    public function findProjectArgumentVotersWithCount(Project $project): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct av) as arguments_votes_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:ArgumentVote av WITH av.user = u
          LEFT JOIN CapcoAppBundle:Argument a WITH av.argument = a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE av.user = u AND a.published = 1 AND (
            (a.opinion IS NOT NULL AND o.published = 1 AND o.step = :project)
            OR
            (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovo.step = :project)
          )
          GROUP BY av.user'
            )
            ->setParameter('project', $project);

        return $query->getResult();
    }

    public function findProjectSourceVotersWithCount(Project $project): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct sv) as sources_votes_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:SourceVote sv WITH sv.user = u
          LEFT JOIN CapcoAppBundle:Source s WITH sv.source = s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE sv.user = u AND s.published = 1 AND (
            (s.opinion IS NOT NULL AND o.published = 1 AND o.step = :project)
            OR
            (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovo.step = :project)
          )
          GROUP BY sv.user
        '
            )
            ->setParameter('project', $project);

        return $query->getResult();
    }

    public function findProjectProposalVotersWithCount(
        Project $project,
        $excludePrivate = false
    ): array {
        $em = $this->getEntityManager();
        $voteWith = $excludePrivate ? '(pv.user = u AND pv.private = 0)' : 'pv.user = u';
        $rawQuery =
            'SELECT u.id, count(distinct pv) as proposals_votes_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:ProposalSelectionVote pv WITH ' .
            $voteWith .
            '
          LEFT JOIN CapcoAppBundle:Proposal p WITH pv.proposal = p
          LEFT JOIN pv.selectionStep s
          LEFT JOIN s.projectAbstractStep pas
          WHERE pv.user = u AND p.published = 1 AND pas.project = :project
          GROUP BY pv.user
        ';
        $query = $em->createQuery($rawQuery)->setParameter('project', $project);

        return $query->getResult();
    }

    public function countProjectProposalAnonymousVotersWithCount(
        Project $project,
        $excludePrivate = false
    ): int {
        $query = $this->getEntityManager()
            ->createQueryBuilder()
            ->select('COUNT(DISTINCT proposal_selection_vote.email)')
            ->from('CapcoAppBundle:ProposalSelectionVote', 'proposal_selection_vote')
            ->leftJoin(
                'CapcoAppBundle:Proposal',
                'proposal',
                Join::WITH,
                'proposal_selection_vote.proposal = proposal'
            )
            ->leftJoin('proposal_selection_vote.selectionStep', 'selection_step')
            ->leftJoin('selection_step.projectAbstractStep', 'project_abstract_step')
            ->andWhere('proposal.published = 1')
            ->andWhere('project_abstract_step.project = :project')
            ->setParameter('project', $project);

        $query->andWhere(
            $query->expr()->andX($query->expr()->isNotNull('proposal_selection_vote.email'))
        );

        if ($excludePrivate) {
            $query->andWhere('proposal_selection_vote.private = 0');
        }

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function findWithMediaByIds($ids): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb
            ->addSelect('m')
            ->leftJoin('u.media', 'm')
            ->where('u.id IN (:ids)')
            ->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    public function getPublishedWith($type = null, $from = null, $to = null): array
    {
        $qb = $this->getIsEnabledQueryBuilder();

        if ($type) {
            $qb->andWhere('u.userType = :type')->setParameter('type', $type);
        }

        if ($from) {
            $qb->andWhere('u.createdAt >= :from')->setParameter('from', $from);
        }

        if ($to) {
            $qb->andWhere('u.createdAt <= :to')->setParameter('to', $to);
        }

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepSourceContributorsWithCount(ConsultationStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct s) as sources_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Source s WITH s.author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE s.published = 1 AND (
            (s.opinion IS NOT NULL AND o.published = 1 AND o.step = :step)
            OR
            (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovo.step = :step)
          )
          GROUP BY u.id
        '
            )
            ->setParameter('step', $step);

        return $query->getResult();
    }

    public function findConsultationStepArgumentContributorsWithCount(ConsultationStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct a) as arguments_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Argument a WITH a.Author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE a.published = 1 AND (
            (a.opinion IS NOT NULL AND o.published = 1 AND o.step = :step)
            OR
            (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovo.step = :step)
          )
          GROUP BY u.id
        '
            )
            ->setParameter('step', $step);

        return $query->getResult();
    }

    public function findConsultationStepOpinionContributorsWithCount(ConsultationStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions) as opinions_count')
            ->leftJoin('u.opinions', 'opinions', 'WITH', 'opinions.published = 1')
            ->where('opinions.step = :step')
            ->groupBy('u.id')
            ->setParameter('step', $step);

        return $qb->getQuery()->getResult();
    }

    public function findCollectStepProposalContributorsWithCount(CollectStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct proposals) as proposals_count')
            ->leftJoin(
                'u.proposals',
                'proposals',
                'WITH',
                'proposals.draft = 0 AND proposals.trashedAt IS NULL AND proposals.deletedAt IS NULL AND proposals.published = 1'
            )
            ->leftJoin('proposals.proposalForm', 'proposalForm')
            ->where('proposalForm.step = :step')
            ->groupBy('u.id')
            ->setParameter('step', $step);

        return $qb->getQuery()->getResult();
    }

    public function findQuestionnaireStepReplyContributorsWithCount(QuestionnaireStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct replies) as replies_count')
            ->leftJoin('u.replies', 'replies', 'WITH', 'replies.published = 1')
            ->leftJoin('replies.questionnaire', 'questionnaire')
            ->where('questionnaire.step = :step')
            ->groupBy('u.id')
            ->setParameter('step', $step);

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepVersionContributorsWithCount(ConsultationStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions) as versions_count')
            ->leftJoin('u.opinionVersions', 'versions', 'WITH', 'versions.published = 1')
            ->leftJoin('versions.parent', 'opinions', 'WITH', 'opinions.published = 1')
            ->where('opinions.step = :step')
            ->groupBy('u.id')
            ->setParameter('step', $step);

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepOpinionVotersWithCount(ConsultationStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions_votes) as opinions_votes_count')
            ->leftJoin(
                'CapcoAppBundle:OpinionVote',
                'opinions_votes',
                'WITH',
                'opinions_votes.user = u AND opinions_votes.published = 1'
            )
            ->leftJoin(
                'opinions_votes.opinion',
                'opinions_votes_opinion',
                'WITH',
                'opinions_votes_opinion.published = 1'
            )
            ->where('opinions_votes_opinion.step = :step')
            ->groupBy('u.id')
            ->setParameter('step', $step);

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepVersionVotersWithCount(ConsultationStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions_votes) as versions_votes_count')
            ->leftJoin(
                'CapcoAppBundle:OpinionVersionVote',
                'versions_votes',
                'WITH',
                'versions_votes.user = u AND versions_votes.published = 1'
            )
            ->leftJoin(
                'versions_votes.opinionVersion',
                'versions_votes_version',
                'WITH',
                'versions_votes_version.published = 1'
            )
            ->leftJoin(
                'versions_votes_version.parent',
                'versions_votes_version_parent',
                'WITH',
                'versions_votes_version_parent.published = 1'
            )
            ->where('versions_votes_version_parent.step = :step')
            ->groupBy('u.id')
            ->setParameter('step', $step);

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepArgumentVotersWithCount(ConsultationStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct av) as arguments_votes_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:ArgumentVote av WITH av.user = u
          LEFT JOIN CapcoAppBundle:Argument a WITH av.argument = a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE av.user = u AND a.published = 1 AND (
            (a.opinion IS NOT NULL AND o.published = 1 AND o.step = :step)
            OR
            (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovo.step = :step)
          )
          GROUP BY av.user
        '
            )
            ->setParameter('step', $step);

        return $query->getResult();
    }

    public function findConsultationStepSourceVotersWithCount(ConsultationStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct sv) as sources_votes_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:SourceVote sv WITH sv.user = u
          LEFT JOIN CapcoAppBundle:Source s WITH sv.source = s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE sv.user = u AND s.published = 1 AND (
            (s.opinion IS NOT NULL AND o.published = 1 AND o.step = :step)
            OR
            (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovo.step = :step)
          )
          GROUP BY sv.user
        '
            )
            ->setParameter('step', $step);

        return $query->getResult();
    }

    public function findSelectionStepProposalVotersWithCount(SelectionStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct pv) as proposals_votes_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:ProposalSelectionVote pv WITH (pv.user = u AND pv.selectionStep = :step)
          LEFT JOIN CapcoAppBundle:Proposal p WITH pv.proposal = p
          WHERE pv.user = u AND pv.published = 1 AND p.draft = 0 AND p.published = 1
          GROUP BY pv.user
        '
            )
            ->setParameter('step', $step);

        return $query->getResult();
    }

    public function countSelectionStepProposalAnonymousVoters(SelectionStep $step): int
    {
        $query = $this->getEntityManager()
            ->createQueryBuilder()
            ->select('COUNT(DISTINCT proposal_selection_vote.email)')
            ->from('CapcoAppBundle:ProposalSelectionVote', 'proposal_selection_vote')
            ->leftJoin(
                'CapcoAppBundle:Proposal',
                'proposal',
                Join::WITH,
                'proposal_selection_vote.proposal = proposal'
            )
            ->andWhere('proposal_selection_vote.published = 1')
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->andWhere('proposal.published = 1')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('proposal_selection_vote.selectionStep = :step');

        $query
            ->andWhere(
                $query->expr()->andX($query->expr()->isNotNull('proposal_selection_vote.email'))
            )
            ->setParameter('step', $step);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function getSearchResults(
        int $nbByPage = 8,
        int $page = 1,
        ?string $sort = null,
        ?string $type = null
    ): Paginator {
        if ($page < 1) {
            throw new \InvalidArgumentException(
                sprintf('The argument "page" cannot be lower than 1 (current value: "%s")', $page)
            );
        }

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('m', 'ut')
            ->leftJoin('u.media', 'm')
            ->leftJoin('u.userType', 'ut');

        if (null !== $type && UserType::FILTER_ALL !== $type) {
            $qb->andWhere('ut.slug = :type')->setParameter('type', $type);
        }

        if (!$sort || 'activity' === $sort) {
            $qb
                ->addSelect(
                    '(
                    u.proposalsCount + 
                    u.proposalCommentsCount + 
                    u.opinionsCount + 
                    u.opinionVersionsCount + 
                    u.argumentsCount + 
                    u.sourcesCount + 
                    u.postCommentsCount 
                    ) AS HIDDEN contributionsCount'
                )
                ->addOrderBy('contributionsCount', 'DESC');
        } else {
            $qb->addOrderBy('u.createdAt', 'DESC');
        }

        if ($nbByPage > 0) {
            $qb->setFirstResult(($page - 1) * $nbByPage)->setMaxResults($nbByPage);
        }

        return new Paginator($qb);
    }

    public function findUsersFollowingAProposal(
        Proposal $proposal,
        $first = 0,
        $offset = 100
    ): Paginator {
        $query = $this->createQueryBuilder('u')
            ->join('u.followingContributions', 'f')
            ->join('f.proposal', 'p')
            ->where('f.proposal = :proposal')
            ->andWhere('p.deletedAt IS NULL')
            ->setParameter('proposal', $proposal)
            ->setMaxResults($offset)
            ->setFirstResult($first);

        return new Paginator($query);
    }

    public function findUsersFollowingAnOpinion(
        Opinion $opinion,
        $first = 0,
        $offset = 100
    ): Paginator {
        $query = $this->createQueryBuilder('u')
            ->join('u.followingContributions', 'f')
            ->join('f.opinion', 'o')
            ->andWhere('f.opinion = :opinion')
            ->setParameter('opinion', $opinion)
            ->setMaxResults($offset)
            ->setFirstResult($first);

        return new Paginator($query);
    }

    public function findFollowersToExport(string $proposalId): array
    {
        $em = $this->getEntityManager();

        $query = $em
            ->createQueryBuilder()
            ->select(['u.id, u.email, u.username, u.firstname, u.lastname, u.slug'])
            ->from('CapcoUserBundle:User', 'u')
            ->addSelect(' f.followedAt, ut.name as userTypeName, p.slug as proposalSlug')
            ->join('u.followingContributions', 'f')
            ->join('f.proposal', 'p')
            ->join('u.userType', 'ut')
            ->andWhere('p.id = :proposalId')
            ->andWhere('p.deletedAt IS NULL')
            ->orderBy('f.followedAt', 'ASC')
            ->setParameter('proposalId', $proposalId);

        return $query->getQuery()->getResult();
    }

    public function isViewerFollowingProposal(Proposal $proposal, User $viewer): bool
    {
        return $this->countFollowerForProposalAndUser($proposal, $viewer) > 0;
    }

    public function isViewerFollowingOpinion(Opinion $opinion, User $viewer): bool
    {
        return $this->countFollowerForOpinionAndUser($opinion, $viewer) > 0;
    }

    public function getByCriteriaOrdered(
        array $criteria,
        array $orderBy,
        $limit = 32,
        $offset = 0
    ): Paginator {
        $qb = $this->getIsEnabledQueryBuilder()->join('u.followingContributions', 'f');

        if (isset($criteria['proposal'])) {
            $qb
                ->join('f.proposal', 'p')
                ->andWhere('p.deletedAt IS NULL')
                ->andWhere('p.id = :proposalId')
                ->setParameter('proposalId', $criteria['proposal']->getId());
        }

        if (isset($criteria['opinion'])) {
            $qb
                ->join('f.opinion', 'o')
                ->andWhere('o.id = :opinionId')
                ->setParameter('opinionId', $criteria['opinion']->getId());
        }

        $sortField = array_keys($orderBy)[0];
        $direction = $orderBy[$sortField];

        switch ($sortField) {
            case 'NAME':
            case 'USERNAME':
                $qb->addOrderBy('u.username', $direction);

                break;
            case 'RANDOM':
                $qb->addSelect('RAND() as HIDDEN rand')->addOrderBy('rand');

                break;
            case 'FOLLOWED_AT':
                $qb->addOrderBy('f.followedAt', $direction);
            // no break
            default:
                $qb->addOrderBy('u.username', $direction);

                break;
        }
        $query = $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->useQueryCache(true); // ->useResultCache(true, 60)

        return new Paginator($query);
    }

    public function countFollowerForProposal(Proposal $proposal): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->join('u.followingContributions', 'f')
            ->join('f.proposal', 'p')
            ->andWhere('f.proposal = :proposal')
            ->andWhere('p.deletedAt IS NULL')
            ->setParameter('proposal', $proposal);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countFollowerForOpinion(Opinion $opinion): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->join('u.followingContributions', 'f')
            ->join('f.opinion', 'p')
            ->andWhere('f.opinion = :opinion')
            ->setParameter('opinion', $opinion);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countFollowerForProposalAndUser(Proposal $proposal, User $user): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->join('u.followingContributions', 'f')
            ->join('f.proposal', 'p')
            ->andWhere('p.id = :proposalId')
            ->andWhere('p.deletedAt IS NULL')
            ->andWhere('u.id = :userId')
            ->setParameter('proposalId', $proposal->getId())
            ->setParameter('userId', $user->getId());

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countFollowerForOpinionAndUser(Opinion $opinion, User $user): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->join('u.followingContributions', 'f')
            ->join('f.opinion', 'o')
            ->andWhere('o.id = :opinionId')
            ->andWhere('u.id = :userId')
            ->setParameter('opinionId', $opinion->getId())
            ->setParameter('userId', $user->getId());

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function findUsersFollowingProposal()
    {
        $followerQuery = $this->getEntityManager()->getRepository('CapcoAppBundle:Follower');
        $followerQuery = $followerQuery->createQueryBuilder('f2')->select('f2.user');
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('u, p, f1')
            ->join('u.followingContributions', 'f1')
            ->join('f1.proposal', 'p')
            ->andWhere('p.deletedAt IS NULL')
            ->andWhere('p IS NOT NULL');
        $qb->where($qb->expr()->in('u.id', $followerQuery->getDQL()));

        return $qb->getQuery()->getResult();
    }

    public function countProposalsFollowed(User $user): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('count(f.id)')
            ->join('u.followingContributions', 'f')
            ->join('f.proposal', 'p')
            ->andWhere('f.user = :user')
            ->andWhere('f.proposal IS NOT NULL')
            ->andWhere('p.deletedAt IS NULL')
            ->setParameter('user', $user);

        return $query->getQuery()->getSingleScalarResult();
    }

    public function findNotEmailConfirmedUsersSince24Hours(): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb
            ->andWhere('u.confirmationToken IS NOT NULL')
            ->andWhere('u.createdAt < :oneDayAgo AND u.createdAt > :oneWeekAgo')
            ->andWhere('u.remindedAccountConfirmationAfter24Hours = false')
            ->setParameter('oneDayAgo', new \DateTime('-1 day'))
            ->setParameter('oneWeekAgo', new \DateTime('-7 day'));

        return $qb->getQuery()->getResult();
    }

    public function countAllowedViewersForProject(Project $project): int
    {
        // TODO why do we need DISTINCT ?
        $query = $this->createQueryBuilder('u')
            ->select('count(DISTINCT u.id)')
            ->leftJoin('u.userGroups', 'uG')
            ->leftJoin('uG.group', 'g')
            ->leftJoin('g.projectsVisibleByTheGroup', 'p')
            ->andWhere('p.id = :project')
            ->setParameter('project', $project->getId());

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getUserFromProposalIds(array $proposalsId): array
    {
        $query = $this->createQueryBuilder('u');

        return $query
            ->select('u as user, p.id')
            ->leftJoin('u.proposals', 'p')
            ->where('p.id IN (:ids)')
            ->setParameter('ids', $proposalsId)
            ->getQuery()
            ->getArrayResult();
    }

    public function getUsersByIds(array $ids): array
    {
        $query = $this->createQueryBuilder('u');
        $query->andWhere('u.id IN (:ids)')->setParameter('ids', $ids);

        return $query->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder(): QueryBuilder
    {
        return $this->createQueryBuilder('u')->andWhere('u.enabled = true');
    }
}
