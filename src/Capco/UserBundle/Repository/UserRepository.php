<?php

namespace Capco\UserBundle\Repository;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\PublicApiToken;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Traits\LocaleRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use ReflectionClass;

/**
 * @method null|User find($id, $lockMode = null, $lockVersion = null)
 * @method null|User findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends EntityRepository
{
    use LocaleRepositoryTrait;

    public function findFacebookUsers(): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->where('u.facebook_id IS NOT NULL')
            ->getQuery()
            ->getResult()
        ;
    }

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb->addSelect('media', 'userType')
            ->leftJoin('u.media', 'media')
            ->leftJoin('u.userType', 'userType')
            ->where('u.id IN (:ids)')
            ->setParameter('ids', $ids)
        ;

        return $qb->getQuery()->getResult();
    }

    public function hydrateFromIdsOrdered(array $ids): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb->addSelect('media', 'userType')
            ->leftJoin('u.media', 'media')
            ->leftJoin('u.userType', 'userType')
            ->addOrderBy('FIELD(u.id, :ids)')
            ->where('u.id IN (:ids)')
            ->setParameter('ids', $ids)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findAuthorsByProjectId(string $projectId)
    {
        $qb = $this->createQueryBuilder('u')
            ->innerJoin(ProjectAuthor::class, 'pa', Expr\Join::WITH, 'u.id = pa.user')
            ->where('pa.project = :id')
            ->setParameter('id', $projectId)
            ->orderBy('u.createdAt')
            ->getQuery()
        ;

        return $qb->getResult();
    }

    public function findUserByPublicApiKey(string $apiKey): ?User
    {
        return $this->createQueryBuilder('u')
            ->innerJoin(PublicApiToken::class, 't', Expr\Join::WITH, 't.user = u.id')
            ->where('t.value = :apiKey')
            ->setParameter('apiKey', $apiKey)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function countUsersInGroup(
        Group $group,
        ?bool $consentInternalCommunication = null,
        bool $emailConfirmed = true
    ): int {
        $qb = $this->createQueryBuilder('u');
        $qb->select('COUNT(u.id)')
            ->innerJoin('u.userGroups', 'ug')
            ->andWhere('ug.group = :group')
            ->setParameter('group', $group)
        ;
        if (null !== $consentInternalCommunication) {
            $qb->andWhere(
                'u.consentInternalCommunication = :consentInternalCommunication'
            )->setParameter('consentInternalCommunication', $consentInternalCommunication);
        }
        if ($emailConfirmed) {
            $qb->andWhere('u.confirmationToken IS NULL');
        } else {
            $qb->andWhere('u.confirmationToken <> NULL');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getUsersInGroup(
        Group $group,
        int $offset = 0,
        int $limit = 1000,
        ?bool $consentInternalCommunication = null,
        bool $emailConfirmed = true
    ): array {
        $qb = $this->createQueryBuilder('u');
        $qb->innerJoin('u.userGroups', 'ug')
            ->andWhere('ug.group = :group')
            ->setParameter('group', $group)
        ;
        if (null !== $consentInternalCommunication) {
            $qb->andWhere(
                'u.consentInternalCommunication = :consentInternalCommunication'
            )->setParameter('consentInternalCommunication', $consentInternalCommunication);
        }
        if ($emailConfirmed) {
            $qb->andWhere('u.confirmationToken IS NULL');
        } else {
            $qb->andWhere('u.confirmationToken <> NULL');
        }
        $qb->setFirstResult($offset)->setMaxResults($limit);

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
            ->getSingleScalarResult()
        ;
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
            ->getSingleScalarResult()
        ;
    }

    public function getRegisteredContributorCount(): int
    {
        $qb = $this->createQueryBuilder('u');

        $qbOpinion = $this->createQueryBuilder('userOpinion');
        $qbOpinion
            ->select('userOpinion.id')
            ->innerJoin('userOpinion.opinions', 'opinion', 'WITH', 'opinion.published = true')
        ;

        $qbSource = $this->createQueryBuilder('userSource');
        $qbSource
            ->select('userSource.id')
            ->innerJoin('userSource.sources', 'source', 'WITH', 'source.published = true')
        ;

        $qbComment = $this->createQueryBuilder('userComment');
        $qbComment
            ->select('userComment.id')
            ->innerJoin('userComment.comments', 'comment', 'WITH', 'comment.published = true')
        ;

        $qbVote = $this->createQueryBuilder('userVote');
        $qbVote
            ->select('userVote.id')
            ->innerJoin('userVote.votes', 'vote', 'WITH', 'vote.published = true')
        ;

        $qbArgument = $this->createQueryBuilder('userArgument');
        $qbArgument
            ->select('userArgument.id')
            ->innerJoin('userArgument.arguments', 'argument', 'WITH', 'argument.published = true')
        ;

        $qbOpinionVersions = $this->createQueryBuilder('userOpinionVersions');
        $qbOpinionVersions
            ->select('userOpinionVersions.id')
            ->innerJoin(
                'userOpinionVersions.opinionVersions',
                'version',
                'WITH',
                'version.published = true'
            )
        ;

        $qbProposal = $this->createQueryBuilder('userProposal');
        $qbProposal
            ->select('userProposal.id')
            ->innerJoin(
                'userProposal.proposals',
                'proposal',
                'WITH',
                'proposal.published = true AND proposal.draft = false'
            )
        ;

        $qbReply = $this->createQueryBuilder('userReply');
        $qbReply
            ->select('userReply.id')
            ->innerJoin('userReply.replies', 'reply', 'WITH', 'reply.published = true')
        ;

        $qb->select('count(DISTINCT u.id)')
            ->orWhere($qb->expr()->in('u.id', $qbReply->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbOpinion->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbArgument->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbProposal->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbOpinionVersions->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbVote->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbComment->getDQL()))
            ->orWhere($qb->expr()->in('u.id', $qbSource->getDQL()))
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult()
        ;
    }

    public function countConfirmedUsersWithoutVoteInDebate(Debate $debate): int
    {
        return $this->getEntityManager()
            ->createQuery(
                'SELECT count(u.id)
                FROM CapcoUserBundle:User u
                WHERE
                    u.confirmationToken IS NULL
                    AND u.email IS NOT NULL
                    AND u.enabled = 1
                    AND u.consentInternalCommunication = 1
                    AND 0 = (
                        SELECT count(distinct v.id)
                        FROM CapcoAppBundle:Debate\DebateVote v
                        WHERE
                            v.user = u
                            AND v.debate= :debate
                    )
                '
            )
            ->setParameter('debate', $debate)
            ->getSingleScalarResult()
        ;
    }

    public function getConfirmedUsersWithoutVoteInDebate(
        Debate $debate,
        int $firstResult = 0,
        int $maxResult = 100
    ): array {
        return $this->getEntityManager()
            ->createQuery(
                'SELECT u
                FROM CapcoUserBundle:User u
                WHERE
                    u.confirmationToken IS NULL
                    AND u.email IS NOT NULL
                    AND u.enabled = 1
                    AND u.consentInternalCommunication = 1
                    AND 0 = (
                        SELECT count(distinct v.id)
                        FROM CapcoAppBundle:Debate\DebateVote v
                        WHERE
                            v.user = u
                            AND v.debate= :debate
                    )
                ORDER BY u.id ASC
                '
            )
            ->setFirstResult($firstResult)
            ->setMaxResults($maxResult)
            ->setParameter('debate', $debate)
            ->getResult()
        ;
    }

    public function findProjectSourceContributorsWithCount(Project $project): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct s) AS sources_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Source s WITH s.author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH oc.step = cs
          LEFT JOIN cs.projectAbstractStep opas
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovoc.step = ovocs
          LEFT JOIN ovocs.projectAbstractStep ovopas
          WHERE s.published = 1 AND (
            (s.opinion IS NOT NULL AND o.published = 1 AND opas.project = :project)
            OR
            (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovopas.project = :project)
          )
          GROUP BY u.id
        '
            )
            ->setParameter('project', $project)
        ;

        return $query->getResult();
    }

    public function findProjectArgumentContributorsWithCount(Project $project): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct a) AS arguments_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Argument a WITH a.author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep cs WITH oc.step = cs
          LEFT JOIN cs.projectAbstractStep opas
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovoc.step = ovocs
          LEFT JOIN ovocs.projectAbstractStep ovopas
          WHERE a.published = 1 AND (
            (a.opinion IS NOT NULL AND o.published = 1 AND opas.project = :project)
            OR
            (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovopas.project = :project)
          )
          GROUP BY u.id
        '
            )
            ->setParameter('project', $project)
        ;

        return $query->getResult();
    }

    public function findOneByEmail(string $email): ?User
    {
        $qb = $this->createQueryBuilder('u');
        $qb->andWhere('u.email = :email')->setParameter('email', $email);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function findOneByOpenIdSID(string $openIdSID): ?User
    {
        $qb = $this->createQueryBuilder('u');
        $qb->andWhere('u.openIdSessionsId LIKE :openIdSessionsId')->setParameter(
            'openIdSessionsId',
            '%' . $openIdSID . '%'
        );

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
            ->select('u.id', 'count(distinct opinions) AS opinions_count')
            ->leftJoin('u.opinions', 'opinions', 'WITH', 'opinions.published = 1')
            ->leftJoin('opinions.consultation', 'consultation')
            ->leftJoin('consultation.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.projectAbstractStep', 'cas')
            ->where('cas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findProjectProposalContributorsWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct proposals) AS proposals_count')
            ->leftJoin('u.proposals', 'proposals', 'WITH', 'proposals.published = 1')
            ->leftJoin('proposals.proposalForm', 'proposalForm')
            ->leftJoin('proposalForm.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.projectAbstractStep', 'pas')
            ->where('pas.project = :project')
            ->andWhere('proposals.draft = 0')
            ->groupBy('u.id')
            ->setParameter('project', $project)
        ;

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
            ->select('u.id', 'count(distinct replies) AS replies_count')
            ->leftJoin('u.replies', 'replies', 'WITH', $replyWith)
            ->leftJoin('replies.questionnaire', 'questionnaire')
            ->leftJoin('questionnaire.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.projectAbstractStep', 'pas')
            ->where('pas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findProjectVersionContributorsWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions) AS versions_count')
            ->leftJoin('u.opinionVersions', 'versions', 'WITH', 'versions.published = 1')
            ->leftJoin('versions.parent', 'opinions', 'WITH', 'opinions.published = 1')
            ->leftJoin('opinions.consultation', 'consultation')
            ->leftJoin('consultation.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.projectAbstractStep', 'cas')
            ->where('cas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findProjectOpinionVotersWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions_votes) AS opinions_votes_count')
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
            ->leftJoin('opinions_votes_opinion.consultation', 'opinions_votes_opinion_consultation')
            ->leftJoin(
                'opinions_votes_opinion_consultation.step',
                'opinions_votes_opinion_consultation_step',
                'WITH',
                'opinions_votes_opinion_consultation_step.isEnabled = 1'
            )
            ->leftJoin('opinions_votes_opinion_consultation_step.projectAbstractStep', 'cas')
            ->where('cas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findProjectVersionVotersWithCount(Project $project): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions_votes) AS versions_votes_count')
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
                'versions_votes_version_parent.consultation',
                'versions_votes_version_parent_consultation'
            )
            ->leftJoin(
                'versions_votes_version_parent_consultation.step',
                'versions_votes_version_parent_consultation_step',
                'WITH',
                'versions_votes_version_parent_consultation_step.isEnabled = 1'
            )
            ->leftJoin('versions_votes_version_parent_consultation_step.projectAbstractStep', 'cas')
            ->where('cas.project = :project')
            ->groupBy('u.id')
            ->setParameter('project', $project)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findProjectArgumentVotersWithCount(Project $project): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct av) AS arguments_votes_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:ArgumentVote av WITH av.user = u
          LEFT JOIN CapcoAppBundle:Argument a WITH av.argument = a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ocs WITH oc.step = :project
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovoc.step = :project
          WHERE av.user = u AND a.published = 1 AND (
            (a.opinion IS NOT NULL AND o.published = 1)
            OR
            (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1)
          )
          GROUP BY av.user'
            )
            ->setParameter('project', $project)
        ;

        return $query->getResult();
    }

    public function findProjectSourceVotersWithCount(Project $project): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct sv) AS sources_votes_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:SourceVote sv WITH sv.user = u
          LEFT JOIN CapcoAppBundle:Source s WITH sv.source = s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ocs WITH oc.step = ocs
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          LEFT JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovoc.step = ovocs
          WHERE sv.user = u AND s.published = 1 AND (
            (s.opinion IS NOT NULL AND o.published = 1 AND oc.step = :project)
            OR
            (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :project)
          )
          GROUP BY sv.user
        '
            )
            ->setParameter('project', $project)
        ;

        return $query->getResult();
    }

    public function findProjectProposalVotersWithCount(
        Project $project,
        $excludePrivate = false
    ): array {
        $em = $this->getEntityManager();
        $voteWith = $excludePrivate ? '(pv.user = u AND pv.private = 0)' : 'pv.user = u';
        $rawQuery =
            'SELECT u.id, count(distinct pv) AS proposals_votes_count
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

    public function findWithMediaByIds($ids): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb->addSelect('m')
            ->leftJoin('u.media', 'm')
            ->where('u.id IN (:ids)')
            ->setParameter('ids', $ids)
        ;

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
                'SELECT u.id, count(distinct s) AS sources_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Source s WITH s.author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ocs WITH oc.step = :step
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovoc.step = :step
          WHERE s.published = 1 AND (
            (s.opinion IS NOT NULL AND o.published = 1)
            OR
            (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1)
          )
          GROUP BY u.id
        '
            )
            ->setParameter('step', $step)
        ;

        return $query->getResult();
    }

    public function findConsultationStepArgumentContributorsWithCount(ConsultationStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct a) AS arguments_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Argument a WITH a.author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ocs WITH oc.step = :step
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovoc.step = :step
          WHERE a.published = 1 AND (
            (a.opinion IS NOT NULL AND o.published = 1)
            OR
            (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1)
          )
          GROUP BY u.id
        '
            )
            ->setParameter('step', $step)
        ;

        return $query->getResult();
    }

    public function findConsultationStepOpinionContributorsWithCount(ConsultationStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions) AS opinions_count')
            ->leftJoin('u.opinions', 'opinions', 'WITH', 'opinions.published = 1')
            ->innerJoin(
                'opinions.consultation',
                'consultation',
                'WITH',
                'consultation.step = :step'
            )
            ->groupBy('u.id')
            ->setParameter('step', $step)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findCollectStepProposalContributorsWithCount(CollectStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct proposals) AS proposals_count')
            ->leftJoin(
                'u.proposals',
                'proposals',
                'WITH',
                'proposals.draft = 0 AND proposals.trashedAt IS NULL AND proposals.deletedAt IS NULL AND proposals.published = 1'
            )
            ->leftJoin('proposals.proposalForm', 'proposalForm')
            ->where('proposalForm.step = :step')
            ->groupBy('u.id')
            ->setParameter('step', $step)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findQuestionnaireStepReplyContributorsWithCount(QuestionnaireStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct replies) AS replies_count')
            ->leftJoin('u.replies', 'replies', 'WITH', 'replies.published = 1')
            ->leftJoin('replies.questionnaire', 'questionnaire')
            ->where('questionnaire.step = :step')
            ->groupBy('u.id')
            ->setParameter('step', $step)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepVersionContributorsWithCount(ConsultationStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions) AS versions_count')
            ->leftJoin('u.opinionVersions', 'versions', 'WITH', 'versions.published = 1')
            ->leftJoin('versions.parent', 'opinions', 'WITH', 'opinions.published = 1')
            ->innerJoin(
                'opinions.consultation',
                'consultation',
                'WITH',
                'consultation.step = :step'
            )
            ->groupBy('u.id')
            ->setParameter('step', $step)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepOpinionVotersWithCount(ConsultationStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions_votes) AS opinions_votes_count')
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
            ->leftJoin('opinions_votes_opinion.consultation', 'opinions_votes_opinion_consultation')
            ->innerJoin(
                'opinions_votes_opinion_consultation.step',
                'opinions_votes_opinion_consultation_step',
                'WITH',
                'opinions_votes_opinion_consultation.step = :step'
            )
            ->groupBy('u.id')
            ->setParameter('step', $step)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepVersionVotersWithCount(ConsultationStep $step): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions_votes) AS versions_votes_count')
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
                'versions_votes_version_parent.consultation',
                'versions_votes_version_parent_consultation'
            )
            ->innerJoin(
                'versions_votes_version_parent_consultation.step',
                'versions_votes_version_parent_consultation_step',
                'WITH',
                'versions_votes_version_parent_consultation.step = :step'
            )
            ->groupBy('u.id')
            ->setParameter('step', $step)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findConsultationStepArgumentVotersWithCount(ConsultationStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct av) AS arguments_votes_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:ArgumentVote av WITH av.user = u
          LEFT JOIN CapcoAppBundle:Argument a WITH av.argument = a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ocs WITH oc.step = :step
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovoc.step = :step
          WHERE av.user = u AND a.published = 1 AND (
            (a.opinion IS NOT NULL AND o.published = 1)
            OR
            (a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1)
          )
          GROUP BY av.user
        '
            )
            ->setParameter('step', $step)
        ;

        return $query->getResult();
    }

    public function findConsultationStepSourceVotersWithCount(ConsultationStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct sv) AS sources_votes_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:SourceVote sv WITH sv.user = u
          LEFT JOIN CapcoAppBundle:Source s WITH sv.source = s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.opinion = o
          LEFT JOIN CapcoAppBundle:Consultation oc WITH o.consultation = oc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ocs WITH oc.step = :step
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          LEFT JOIN CapcoAppBundle:Consultation ovoc WITH ovo.consultation = ovoc
          INNER JOIN CapcoAppBundle:Steps\ConsultationStep ovocs WITH ovoc.step = :step
          WHERE sv.user = u AND s.published = 1 AND (
            (s.opinion IS NOT NULL AND o.published = 1)
            OR
            (s.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1)
          )
          GROUP BY sv.user
        '
            )
            ->setParameter('step', $step)
        ;

        return $query->getResult();
    }

    public function findSelectionStepProposalVotersWithCount(SelectionStep $step): array
    {
        $em = $this->getEntityManager();
        $query = $em
            ->createQuery(
                'SELECT u.id, count(distinct pv) AS proposals_votes_count
          FROM CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:ProposalSelectionVote pv WITH (pv.user = u AND pv.selectionStep = :step)
          LEFT JOIN CapcoAppBundle:Proposal p WITH pv.proposal = p
          WHERE pv.user = u AND pv.published = 1 AND p.draft = 0 AND p.published = 1
          GROUP BY pv.user
        '
            )
            ->setParameter('step', $step)
        ;

        return $query->getResult();
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
            ->setFirstResult($first)
            ->addOrderBy('f.followedAt', 'ASC')
        ;

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
            ->setFirstResult($first)
            ->addOrderBy('f.followedAt', 'ASC')
        ;

        return new Paginator($query);
    }

    public function findFollowersToExport(string $proposalId, ?string $locale = null): array
    {
        $locale = $this->getLocale($locale);
        $em = $this->getEntityManager();

        $query = $em
            ->createQueryBuilder()
            ->select(['u.id, u.email, u.username, u.firstname, u.lastname, u.slug'])
            ->from('CapcoUserBundle:User', 'u')
            ->addSelect(' f.followedAt, utt.name AS userTypeName, p.slug AS proposalSlug')
            ->join('u.followingContributions', 'f')
            ->join('f.proposal', 'p')
            ->join('u.userType', 'ut')
            ->leftJoin('ut.translations', 'utt')
            ->andWhere('p.id = :proposalId')
            ->andWhere('p.deletedAt IS NULL')
            ->andWhere('utt.locale = :locale')
            ->orderBy('f.followedAt', 'ASC')
            ->setParameter('proposalId', $proposalId)
            ->setParameter('locale', $locale)
        ;

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

    public function isViewerFollowingOpinionVersion(OpinionVersion $version, User $viewer): bool
    {
        return $this->countFollowerForOpinionVersionAndUser($version, $viewer) > 0;
    }

    public function getByCriteriaOrdered(
        array $criteria,
        array $orderBy,
        $limit = 32,
        $offset = 0
    ): Paginator {
        $qb = $this->getIsEnabledQueryBuilder()->join('u.followingContributions', 'f');

        if (isset($criteria['proposal'])) {
            $qb->join('f.proposal', 'p')
                ->andWhere('p.deletedAt IS NULL')
                ->andWhere('p.id = :proposalId')
                ->setParameter('proposalId', $criteria['proposal']->getId())
            ;
        }

        if (isset($criteria['opinion'])) {
            $qb->join('f.opinion', 'o')
                ->andWhere('o.id = :opinionId')
                ->setParameter('opinionId', $criteria['opinion']->getId())
            ;
        }

        if (isset($criteria['opinionVersion'])) {
            $qb->join('f.opinionVersion', 'ov')
                ->andWhere('ov.id = :opinionVersionId')
                ->setParameter('opinionVersionId', $criteria['opinionVersion']->getId())
            ;
        }

        if (isset($criteria['projectDistrict'])) {
            $qb->join('f.projectDistrict', 'pd')
                ->andWhere('pd.id = :projectDistrict')
                ->setParameter('projectDistrict', $criteria['projectDistrict']->getId())
            ;
        }

        $sortField = array_keys($orderBy)[0];
        $direction = $orderBy[$sortField];

        switch ($sortField) {
            case 'NAME':
            case 'USERNAME':
                $qb->addOrderBy('u.username', $direction);

                break;

            case 'RANDOM':
                $qb->addSelect('RAND() AS HIDDEN rand')->addOrderBy('rand');

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
            ->useQueryCache(true)
        ;

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
            ->setParameter('proposal', $proposal)
        ;

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countFollowerForOpinion(Opinion $opinion): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->join('u.followingContributions', 'f')
            ->join('f.opinion', 'p')
            ->andWhere('f.opinion = :opinion')
            ->setParameter('opinion', $opinion)
        ;

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countFollowerForOpinionVersion(OpinionVersion $opinionVersion): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->join('u.followingContributions', 'f')
            ->join('f.opinionVersion', 'ov')
            ->andWhere('f.opinionVersion = :opinionVersion')
            ->setParameter('opinionVersion', $opinionVersion)
        ;

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
            ->setParameter('userId', $user->getId())
        ;

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
            ->setParameter('userId', $user->getId())
        ;

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countFollowerForOpinionVersionAndUser(OpinionVersion $version, User $user): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->join('u.followingContributions', 'f')
            ->join('f.opinionVersion', 'ov')
            ->andWhere('ov.id = :versionId')
            ->andWhere('u.id = :userId')
            ->setParameter('versionId', $version->getId())
            ->setParameter('userId', $user->getId())
        ;

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
            ->andWhere('p IS NOT NULL')
        ;
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
            ->setParameter('user', $user)
        ;

        return $query->getQuery()->getSingleScalarResult();
    }

    public function foundUnconfirmedUsersInTheLast24Hours(): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb->select('u.id')
            ->andWhere('u.confirmationToken IS NOT NULL')
            ->andWhere('u.createdAt < :oneDayAgo AND u.createdAt > :oneWeekAgo')
            ->andWhere('u.remindedAccountConfirmationAfter24Hours = false')
            ->setParameter('oneDayAgo', new \DateTime('-1 day'))
            ->setParameter('oneWeekAgo', new \DateTime('-7 day'))
        ;

        return $qb->getQuery()->getResult();
    }

    public function getUnconfirmedUsers(): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.confirmationToken IS NOT NULL')
            ->getQuery()
            ->getResult()
        ;
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
            ->setParameter('project', $project->getId())
        ;

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getUserFromProposalIds(array $proposalsId): array
    {
        $query = $this->createQueryBuilder('u');

        return $query
            ->select('u AS user, p.id')
            ->leftJoin('u.proposals', 'p')
            ->where('p.id IN (:ids)')
            ->setParameter('ids', $proposalsId)
            ->getQuery()
            ->getArrayResult()
        ;
    }

    public function findByRole(string $role): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb->where('u.roles LIKE :roles')
            ->orderBy('u.email', 'ASC')
            ->setParameter('roles', '%"' . $role . '"%')
        ;

        return $qb->getQuery()->getResult();
    }

    public function findByRoleAdminOrSuperAdmin(): array
    {
        $qb = $this->createQueryBuilder('u');
        $qb->where('u.roles LIKE :roleAdmin OR u.roles LIKE :roleSuperAdmin')->setParameters([
            'roleAdmin' => '%ROLE_ADMIN%',
            'roleSuperAdmin' => '%ROLE_SUPER_ADMIN%',
        ]);

        return $qb->getQuery()->getResult();
    }

    /**
     * @return string[]
     */
    public function findByEmails(array $emails): array
    {
        $qb = $this->createQueryBuilder('u');
        $results = $qb
            ->select('u.email')
            ->where('u.email IN (:emails)')
            ->setParameter('emails', $emails)
            ->getQuery()
            ->getArrayResult()
        ;

        return array_map(fn (array $row) => $row['email'], $results);
    }

    public function findByAccessTokenOrUsername(
        string $accessToken = '',
        string $accessId = ''
    ): ?User {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select('u')
            ->orWhere('u.franceConnectId = :accessId')
            ->orWhere('u.franceConnectAccessToken = :accessToken')
            ->orWhere('u.facebook_access_token = :accessToken')
            ->orWhere('u.facebook_id = :accessId')
            ->orWhere('u.openIdAccessToken = :accessToken')
            ->orWhere('u.openId = :accessId')
            ->orWhere('u.twitter_access_token = :accessToken')
            ->orWhere('u.twitter_id = :accessId')
            ->setParameter('accessToken', $accessToken)
            ->setParameter('accessId', $accessId)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function getAllAdmin(): array
    {
        return $this->findByRole('ROLE_ADMIN');
    }

    public function getFromInternalList(
        string $internalList,
        bool $includeUnsubscribed = false,
        bool $includeSuperAdmin = false
    ): array {
        $qb = $this->createQueryBuilder('u');
        $qb->select('u')->where('u.email IS NOT NULL');
        $qb->andWhere('u.enabled = 1');

        if (!$includeUnsubscribed) {
            $qb->andWhere('u.consentInternalCommunication = 1');
        }

        if (!$includeSuperAdmin) {
            $qb->andWhere('u.roles NOT LIKE :role')->setParameter('role', '%ROLE_SUPER_ADMIN%');
        }

        if (EmailingCampaignInternalList::CONFIRMED === $internalList) {
            $qb->andWhere('u.confirmationToken IS NULL');
        } elseif (EmailingCampaignInternalList::NOT_CONFIRMED === $internalList) {
            $qb->andWhere('u.confirmationToken IS NOT NULL');
        }

        return $qb->getQuery()->getResult();
    }

    public function getAssignedUsersOnProposal(Proposal $proposal, string $revisedAt)
    {
        $sql = <<<'EOF'
                SELECT ps.supervisor_id AS "assignedUser" FROM proposal_supervisor ps
                LEFT JOIN fos_user fu ON ps.supervisor_id = fu.id
                WHERE proposal_id = :proposalId
                UNION
                SELECT pa.analyst_id AS "assignedUser"  FROM proposal_analyst pa
                LEFT JOIN fos_user fu2 ON pa.analyst_id = fu2.id
                WHERE proposal_id = :proposalId
                UNION
                SELECT pdm.decision_maker_id AS "assignedUser" FROM proposal_decision_maker pdm
                LEFT JOIN fos_user fu3 ON pdm.decision_maker_id = fu3.id
                WHERE proposal_id = :proposalId
                UNION
                SELECT pr.author_id AS "assignedUser" FROM proposal_revision pr
                LEFT JOIN fos_user fu4 ON pr.author_id = fu4.id
                WHERE proposal_id = :proposalId and revised_at = :revisedAt
            EOF;

        $stmt = $this->getEntityManager()
            ->getConnection()
            ->prepare($sql)
        ;
        $stmt->bindValue('proposalId', $proposal->getId());
        $stmt->bindValue('revisedAt', new \DateTime($revisedAt), 'datetime');
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function findDuplicatesUsers()
    {
        $sql = <<<'EOF'
                SELECT u.id AS userId, u.france_connect_id AS sso_id, u.email AS email, COUNT(u.id) AS duplicates, 'franceConnect' SSO  FROM fos_user u
                WHERE france_connect_id IS NOT NULL
                GROUP BY u.france_connect_id
                HAVING duplicates > 1
                UNION
                SELECT u.id AS userId, u.twitter_id AS sso_id, u.email AS email, COUNT(u.id) AS duplicates, 'twitter' SSO  FROM fos_user u
                WHERE twitter_id IS NOT NULL
                GROUP BY u.twitter_id
                HAVING duplicates > 1
                UNION
                SELECT u.id AS userId, u.facebook_id AS sso_id, u.email AS email, COUNT(u.id) AS duplicates, 'facebook' SSO  FROM fos_user u
                WHERE facebook_id IS NOT NULL
                GROUP BY u.facebook_id
                HAVING duplicates > 1
                UNION
                SELECT u.id AS userId, u.openid_id AS sso_id, u.email AS email, COUNT(u.id) AS duplicates, 'openId'  SSO  FROM fos_user u
                WHERE openid_id IS NOT NULL
                GROUP BY u.openid_id
                HAVING duplicates > 1
            EOF;

        $stmt = $this->getEntityManager()
            ->getConnection()
            ->prepare($sql)
        ;
        $result = $stmt->executeQuery();

        return $result->fetchAllAssociative();
    }

    public function prefixUserSSoId(string $userId, string $ssoFieldName, int $key)
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->update()
            ->set(
                'u.' . $ssoFieldName,
                $qb->expr()->concat($qb->expr()->literal("duplicate-{$key}-"), 'u.' . $ssoFieldName)
            )
            ->where('u.id = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findDuplicateFranceConnect(): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select(
                'u.id AS userId',
                'u.franceConnectId AS france_connect_id',
                'u.email',
                'COUNT(u.id) AS duplicates'
            )
            ->where('u.franceConnectId IS NOT NULL')
            ->groupBy('u.franceConnectId')
            ->having('duplicates > 1')
            ->getQuery()
            ->getResult()
        ;
    }

    public function findDuplicateFacebook(): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select('u.id AS userId', 'u.facebook_id', 'u.email', 'COUNT(u.id) AS duplicates')
            ->where('u.facebook_id IS NOT NULL')
            ->groupBy('u.facebook_id')
            ->having('duplicates > 1')
            ->getQuery()
            ->getResult()
        ;
    }

    public function findDuplicateTwitter(): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select('u.id AS userId', 'u.twitter_id', 'u.email', 'COUNT(u.id) AS duplicates')
            ->where('u.twitter_id IS NOT NULL')
            ->groupBy('u.twitter_id')
            ->having('duplicates > 1')
            ->getQuery()
            ->getResult()
        ;
    }

    public function findDuplicateOpenId(): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select(
                'u.id AS userId',
                'u.openId AS openid_id',
                'u.email',
                'COUNT(u.id) AS duplicates'
            )
            ->where('u.openId IS NOT NULL')
            ->groupBy('u.openId')
            ->having('duplicates > 1')
            ->getQuery()
            ->getResult()
        ;
    }

    public function findSameFranceConnectId(string $franceConnectId): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select('u.id AS userId', 'u.franceConnectId AS france_connect_id', 'u.email')
            ->where('u.franceConnectId = :fcId')
            ->setParameter('fcId', $franceConnectId)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findSameFacebookId(string $facebookId): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select('u.id AS userId', 'u.facebook_id', 'u.email')
            ->where('u.facebook_id = :fbId')
            ->setParameter('fbId', $facebookId)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findSameTwitterId(string $twitterId): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select('u.id AS userId', 'u.twitter_id', 'u.email')
            ->where('u.twitter_id = :twitterId')
            ->setParameter('twitterId', $twitterId)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findSameOpenId(string $samlId): array
    {
        $qb = $this->createQueryBuilder('u');

        return $qb
            ->select('u.id AS userId', 'u.openId AS openId_id', 'u.email')
            ->where('u.openId = :openId')
            ->setParameter('openId', $samlId)
            ->getQuery()
            ->getResult()
        ;
    }

    public function isAssignedUsersOnProposal(User $user): bool
    {
        $sql = <<<'EOF'
                SELECT ps.supervisor_id AS "assignedUser" FROM proposal_supervisor ps
                LEFT JOIN fos_user fu ON ps.supervisor_id = fu.id
                WHERE supervisor_id = :userid
                UNION
                SELECT pa.analyst_id AS "assignedUser"  FROM proposal_analyst pa
                LEFT JOIN fos_user fu2 ON pa.analyst_id = fu2.id
                WHERE analyst_id = :userid
                UNION
                SELECT pdm.decision_maker_id AS "assignedUser" FROM proposal_decision_maker pdm
                LEFT JOIN fos_user fu3 ON pdm.decision_maker_id = fu3.id
                WHERE decision_maker_id = :userid
            EOF;

        $stmt = $this->getEntityManager()
            ->getConnection()
            ->prepare($sql)
        ;
        $stmt->bindValue('userid', $user->getId());

        return \count($stmt->executeQuery()->fetchAllAssociative()) > 0;
    }

    public function getUsersInMailingList(
        MailingList $mailingList,
        bool $validEmailOnly = true,
        bool $consentInternalOnly = true,
        ?int $offset = null,
        ?int $limit = null
    ): Paginator {
        $qb = $this->createQueryBuilder('u')
            ->leftJoin('CapcoAppBundle:MailingList', 'ml', 'WITH', 'u MEMBER OF ml.users')
            ->where('ml = :mailingList')
            ->orderBy('u.createdAt')
            ->setParameter('mailingList', $mailingList)
        ;
        if ($validEmailOnly) {
            $qb->andWhere('u.email IS NOT NULL');
        }
        if ($consentInternalOnly) {
            $qb->andWhere('u.consentInternalCommunication = 1');
        }
        if ($offset) {
            $qb->setFirstResult($offset);
        }
        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return new Paginator($qb);
    }

    public function countUsersInMailingList(
        MailingList $mailingList,
        bool $validEmailOnly = true,
        bool $consentInternalOnly = true
    ): int {
        $qb = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->leftJoin('CapcoAppBundle:MailingList', 'ml', 'WITH', 'u MEMBER OF ml.users')
            ->where('ml = :mailingList')
            ->setParameter('mailingList', $mailingList)
        ;
        if ($validEmailOnly) {
            $qb->andWhere('u.email IS NOT NULL');
        }
        if ($consentInternalOnly) {
            $qb->andWhere('u.consentInternalCommunication = 1');
        }

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countPhoneConfirmedUsers(): int
    {
        $qb = $this->createQueryBuilder('u')
            ->select('count(u.id)')
            ->where('u.phoneConfirmed = true')
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllNonAdmin(): array
    {
        $qb = $this->createQueryBuilder('u');

        /**
         * This can be improved when php enums are implemented.
         */
        $allRoles = new ReflectionClass(UserRole::class);
        $roles = $allRoles->getConstants();

        $qb->select('u');

        foreach ($roles as $role) {
            if ('ROLE_USER' != $role) {
                $qb->andWhere('u.roles NOT LIKE :' . strtolower($role))->setParameter(strtolower($role), '%' . $role . '%');
            }
        }

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder(): QueryBuilder
    {
        return $this->createQueryBuilder('u')->andWhere('u.enabled = true');
    }
}
