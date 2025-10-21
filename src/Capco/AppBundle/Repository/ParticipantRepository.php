<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Doctrine\ORM\QueryBuilder;

/**
 * @method null|Participant find($id, $lockMode = null, $lockVersion = null)
 * @method null|Participant findOneBy(array $criteria, array $orderBy = null)
 * @method Participant[]    findAll()
 * @method Participant[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ParticipantRepository extends EntityRepository
{
    public function findPaginated(
        ?int $limit = null,
        ?int $offset = null,
        ?bool $consentInternalCommunication = null,
        ?bool $emailConfirmed = true,
    ): array {
        $qb = $this->createQueryBuilder('p')
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50)
        ;

        $qb = $this->getParticipantsWithFiltersQueryBuilder($qb, $consentInternalCommunication, $emailConfirmed);

        return $qb
            ->getQuery()
            ->getResult()
            ;
    }

    public function countWithFilters(
        ?bool $consentInternalCommunication = null,
        ?bool $emailConfirmed = true,
    ): bool|float|int|string|null {
        $qb = $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
        ;

        $qb = $this->getParticipantsWithFiltersQueryBuilder($qb, $consentInternalCommunication, $emailConfirmed);

        return $qb
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function add(Participant $entity, bool $flush = true): void
    {
        $this->_em->persist($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }

    /**
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function remove(Participant $entity, bool $flush = true): void
    {
        $this->_em->remove($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }

    public function findByMediator(Mediator $mediator, ?string $fullname = null, $orderByField = 'createdAt', $orderByDirection = 'DESC')
    {
        $qb = $this->findByMediatorQueryBuilder($mediator, $fullname);

        $qb->orderBy("p.{$orderByField}", $orderByDirection);

        return $qb->getQuery()->getResult();
    }

    public function countByMediator(Mediator $mediator, ?string $fullname = null)
    {
        $qb = $this->findByMediatorQueryBuilder($mediator, $fullname)
            ->select('COUNT(DISTINCT(p.id))')
        ;

        try {
            return $qb->getQuery()->getSingleScalarResult();
        } catch (NoResultException) {
            return 0;
        }
    }

    /**
     * @return array<Participant>
     */
    public function findWithReplies(Project $project, ?QuestionnaireStep $step = null, ?string $term = null): array
    {
        $qb = $this->findWithRepliesQueryBuilder($project, $step, $term);

        return $qb->getQuery()->getResult();
    }

    public function countWithVotes(Project $project, ?ProposalStepInterface $step = null): int
    {
        $sql = <<<'SQL'
                        SELECT COUNT(p.id)
                        FROM participant p
                        JOIN votes v ON v.participant_id = p.id AND v.voteType IN ('proposalSelection', 'proposalCollect')
                        JOIN step s ON s.id = v.collect_step_id or s.id = v.selection_step_id
                        JOIN project_abstractstep pas ON s.id = pas.step_id
                        WHERE pas.project_id = :project AND v.is_accounted = 1
            SQL;

        if ($step) {
            $sql .= ' AND s.id = :step';
        }

        $em = $this->getEntityManager();
        $stmt = $em->getConnection()->prepare($sql);

        $params = ['project' => $project->getId()];

        if ($step) {
            $params['step'] = $step->getId();
        }

        $result = $stmt->executeQuery($params);
        $count = $result->fetchOne();

        return $count ?? 0;
    }

    public function countTotalAccountedByMediator(Mediator $mediator): int
    {
        $sql = <<<'SQL'
                        SELECT COUNT(participant.id)
                        FROM (
                                SELECT p.id
                                FROM participant p
                                JOIN votes v ON p.id = v.participant_id
                                WHERE v.mediator_id = :mediator
                                GROUP BY p.id
                                HAVING COUNT(v.id) = SUM(v.is_accounted)
                        ) as participant
            SQL;
        $em = $this->getEntityManager();
        $stmt = $em->getConnection()->prepare($sql);
        $result = $stmt->executeQuery(['mediator' => $mediator->getId()]);
        $count = $result->fetchOne();

        return $count ?? 0;
    }

    public function countTotalOptInByMediator(Mediator $mediator): int
    {
        $sql = <<<'SQL'
                        SELECT count(participant.id)
                        FROM (
                            SELECT p.id
                            FROM participant p
                            JOIN votes v ON p.id = v.participant_id
                            WHERE v.mediator_id = :mediator
                            AND p.email IS NOT NULL
                            GROUP BY p.email
                        ) as participant
            SQL;
        $em = $this->getEntityManager();
        $stmt = $em->getConnection()->prepare($sql);
        $result = $stmt->executeQuery(['mediator' => $mediator->getId()]);
        $count = $result->fetchOne();

        return $count ?? 0;
    }

    public function countWithContributionsByProject(Project $project, ?AbstractStep $step = null, ?string $term = null): int
    {
        $em = $this->getEntityManager();

        $where = '';

        if ($term) {
            $where .= 'WHERE p.firstname LIKE :term OR p.lastname LIKE :term OR p.email LIKE :term';
        }

        if ($step instanceof ProposalStepInterface) {
            $sql = "
            SELECT count(distinct p.id)
            FROM participant p
            JOIN votes v ON v.participant_id = p.id AND (v.selection_step_id = :stepId OR v.collect_step_id = :stepId) AND v.completion_status = 'COMPLETED' AND v.is_accounted = 1
            {$where}
        ";
        } elseif ($step instanceof QuestionnaireStep) {
            $sql = "
                SELECT count(distinct p.id)
                FROM participant p
                JOIN reply r ON r.participant_id = p.id AND r.completion_status = 'COMPLETED'
                JOIN questionnaire q ON r.questionnaire_id = q.id AND q.step_id = :stepId
                {$where}
        ";
        } else {
            $sql = "
                    SELECT COUNT(DISTINCT p.id)
                    FROM (SELECT p.id
                      FROM participant p
                               JOIN project_abstractstep pas ON pas.project_id = :projectId
                               JOIN step s ON pas.step_id = s.id AND s.step_type IN ('collect', 'selection')
                               JOIN votes v ON v.participant_id = p.id AND (v.selection_step_id = s.id OR v.collect_step_id = s.id) AND
                                               v.completion_status = 'COMPLETED' AND v.is_accounted = 1
                               {$where}
                      UNION
                      SELECT p.id
                      FROM participant p
                               JOIN project_abstractstep pas ON pas.project_id = :projectId
                               JOIN step s ON pas.step_id = s.id AND s.step_type IN ('questionnaire')
                               JOIN reply r ON r.participant_id = p.id AND r.completion_status = 'COMPLETED'
                               JOIN questionnaire q ON r.questionnaire_id = q.id AND s.id = q.step_id
                               {$where}
                      ) AS p
        ";
        }

        $params = [];
        if ($step) {
            $params['stepId'] = $step->getId();
        } else {
            $params = ['projectId' => $project->getId()];
        }

        if ($term) {
            $params['term'] = "%{$term}%";
        }

        $stmt = $em->getConnection()->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchColumn();
    }

    /**
     * @return array<Participant>
     */
    public function getParticipantsWithContributionsByProject(Project $project, ?AbstractStep $step = null, ?string $term = null): array
    {
        $em = $this->getEntityManager();
        $rsm = new ResultSetMappingBuilder($em);

        $rsm->addRootEntityFromClassMetadata(Participant::class, 'p');

        $where = '';
        if ($term) {
            $where .= 'WHERE (p.firstname LIKE :term OR p.lastname LIKE :term OR p.email LIKE :term)';
        }

        if ($step instanceof ProposalStepInterface) {
            $sql = "
            SELECT distinct p.*
            FROM participant p
            JOIN votes v ON v.participant_id = p.id AND (v.selection_step_id = :stepId OR v.collect_step_id = :stepId) AND v.completion_status = 'COMPLETED' AND v.is_accounted = 1
            ORDER BY p.id, p.firstname
        ";
        } elseif ($step instanceof QuestionnaireStep) {
            $sql = "
                SELECT distinct p.*
                FROM participant p
                JOIN reply r ON r.participant_id = p.id AND r.completion_status = 'COMPLETED'
                JOIN questionnaire q ON r.questionnaire_id = q.id AND q.step_id = :stepId
                ORDER BY p.id, p.firstname
        ";
        } else {
            $sql = "
            SELECT p.* FROM (
                SELECT p.*
                FROM participant p
                JOIN project_abstractstep pas ON pas.project_id = :projectId
                JOIN step s ON pas.step_id = s.id AND s.step_type IN ('collect', 'selection')
                JOIN votes v ON v.participant_id = p.id AND (v.selection_step_id = s.id OR v.collect_step_id = s.id) AND v.completion_status = 'COMPLETED' AND v.is_accounted = 1
                {$where}
                UNION
                SELECT p.*
                FROM participant p
                JOIN project_abstractstep pas ON pas.project_id = :projectId
                JOIN step s ON pas.step_id = s.id AND s.step_type IN ('questionnaire')
                JOIN reply r ON r.participant_id = p.id AND r.completion_status = 'COMPLETED'
                JOIN questionnaire q ON r.questionnaire_id = q.id AND s.id = q.step_id
                {$where}
            ) p ORDER BY p.id, p.firstname
        ";
        }

        $query = $em
            ->createNativeQuery($sql, $rsm)
            ->setParameter('projectId', $project->getId())
        ;

        if ($step) {
            $query->setParameter('stepId', $step->getId());
        }

        if ($term) {
            $query->setParameter('term', "%{$term}%");
        }

        return $query->getResult();
    }

    /**
     * @return array<Participant>
     */
    public function findWithVotes(Project $project, ?ProposalStepInterface $step = null, ?string $term = null): array
    {
        $em = $this->getEntityManager();
        $rsm = new ResultSetMappingBuilder($em);

        $rsm->addRootEntityFromClassMetadata(Participant::class, 'p');

        $sql = <<<'SQL'
                        SELECT p.*
                        FROM participant p
                        JOIN votes v ON v.participant_id = p.id AND v.voteType IN ('proposalSelection', 'proposalCollect')
                        JOIN step s ON s.id = v.collect_step_id or s.id = v.selection_step_id
                        JOIN project_abstractstep pas ON s.id = pas.step_id
                        WHERE pas.project_id = :project AND v.is_accounted = 1
            SQL;

        if ($term) {
            $sql .= ' AND (p.firstname LIKE :term OR p.lastname LIKE :term OR p.email LIKE :term)';
        }

        if ($step) {
            $sql .= ' AND s.id = :step';
        }

        $sql .= ' ORDER BY p.id, p.firstname ASC';

        $query = $em
            ->createNativeQuery($sql, $rsm)
            ->setParameter('project', $project->getId())
        ;

        if ($step) {
            $query->setParameter('step', $step->getId());
        }

        if ($term) {
            $query->setParameter('term', "%{$term}%");
        }

        return $query->getResult();
    }

    public function findByTokens(string $token, string $base64Token): ?Participant
    {
        $qb = $this->createQueryBuilder('p')
            ->where('p.token = :token')
            ->orWhere('p.token = :base64Token')
            ->setParameter('token', $token)
            ->setParameter('base64Token', $base64Token)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * @return array<Participant>
     */
    public function getQuestionnaireParticipants(Questionnaire $questionnaire, int $offset, int $limit): array
    {
        $qb = $this->createQueryBuilder('p')
            ->select('p')
            ->innerJoin('p.replies', 'r')
            ->innerJoin('r.questionnaire', 'q')
            ->where('q.id = :questionnaireId')
            ->andWhere('r.draft = :draft')
            ->groupBy('p.id')
            ->orderBy('p.id', 'ASC')
            ->setParameter('questionnaireId', $questionnaire->getId())
            ->setParameter('draft', false)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return $qb->getQuery()->getResult();
    }

    public function hasNewParticipantsForAQuestionnaire(Questionnaire $questionnaire, \DateTime $mostRecentFileModificationDate): bool
    {
        $qb = $this->createQueryBuilder('p')
            ->select('count(p.id)')
            ->innerJoin('p.replies', 'r')
            ->innerJoin('r.questionnaire', 'q')
            ->where('q.id = :questionnaireId')
            ->andWhere('p.updatedAt > :userLastUpdateDate')
            ->orWhere('r.updatedAt > :replyLastUpdateDate')
            ->setParameter('questionnaireId', $questionnaire->getId())
            ->setParameter('userLastUpdateDate', $mostRecentFileModificationDate)
            ->setParameter('replyLastUpdateDate', $mostRecentFileModificationDate)
        ;

        return $qb->getQuery()->getSingleScalarResult() > 0;
    }

    public function getParticipantsWithFiltersQueryBuilder(QueryBuilder $qb, ?bool $consentInternalCommunication = null, ?bool $emailConfirmed = null): QueryBuilder
    {
        if (null !== $consentInternalCommunication) {
            $qb->andWhere('p.consentInternalCommunication = :consentInternalCommunication');
            $qb->andWhere('p.confirmationToken IS NULL');
            $qb->andWhere('p.email IS NOT NULL');
            $qb->setParameter('consentInternalCommunication', $consentInternalCommunication);
        }

        if (null !== $emailConfirmed) {
            $qb->andWhere('p.email IS NOT NULL');

            $confirmationTokenCondition = $emailConfirmed ? 'IS NULL' : 'IS NOT NULL';
            $qb->andWhere("p.confirmationToken {$confirmationTokenCondition}");
        }

        return $qb;
    }

    /**
     * @return array<Participant>
     */
    public function getFromInternalList(
        bool $includeUnsubscribed = false,
    ): array {
        $qb = $this->createQueryBuilder('p');
        $qb->select('p')->where('p.email IS NOT NULL');
        $qb->andWhere('p.confirmationToken IS NULL');

        if (!$includeUnsubscribed) {
            $qb->andWhere('p.consentInternalCommunication = 1');
        }

        return $qb->getQuery()->getResult();
    }

    public function findWithContributionsByProjectAndParticipant(Project $project, Participant $participant): bool
    {
        $em = $this->getEntityManager();
        $sql = "
            SELECT p.id
            FROM participant p
            JOIN project_abstractstep pas ON pas.project_id = :projectId
            JOIN step s ON pas.step_id = s.id AND s.step_type IN ('collect', 'selection')
            JOIN votes v ON v.participant_id = p.id AND (v.selection_step_id = s.id OR v.collect_step_id = s.id) AND v.is_accounted = 1
            WHERE p.id = :participantId
            UNION
            SELECT p.id
            FROM participant p
            JOIN project_abstractstep pas ON pas.project_id = :projectId
            JOIN step s ON pas.step_id = s.id AND s.step_type IN ('questionnaire')
            JOIN reply r ON r.participant_id = p.id AND r.completion_status = 'COMPLETED'
            JOIN questionnaire q ON r.questionnaire_id = q.id AND s.id = q.step_id
            WHERE p.id = :participantId
";
        // todo implements parcours proposal when merged

        $params = ['projectId' => $project->getId(), 'participantId' => $participant->getId()];

        return $em->getConnection()->executeStatement($sql, $params) > 0;
    }

    /**
     * @return array<Participant>
     */
    public function getParticipantsInMailingList(
        MailingList $mailingList,
        bool $validEmailOnly = true,
        bool $consentInternalOnly = true,
        ?int $offset = null,
        ?int $limit = null
    ): array {
        $qb = $this->createQueryBuilder('p')
            ->innerJoin(
                'CapcoAppBundle:MailingListUser',
                'mlu',
                'WITH',
                'mlu.participant = p'
            )
            ->where('mlu.mailingList = :mailingList')
            ->orderBy('p.createdAt')
            ->setParameter('mailingList', $mailingList)
        ;
        if ($validEmailOnly) {
            $qb->andWhere('p.email IS NOT NULL');
        }
        if ($consentInternalOnly) {
            $qb->andWhere('p.consentInternalCommunication = 1');
        }
        if ($offset) {
            $qb->setFirstResult($offset);
        }
        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    public function countParticipantsInMailingList(
        MailingList $mailingList,
        bool $validEmailOnly = true,
        bool $consentInternalOnly = true
    ): int {
        $qb = $this->createQueryBuilder('p')
            ->select('count(p.id)')
            ->innerJoin(
                'CapcoAppBundle:MailingListUser',
                'mlu',
                'WITH',
                'mlu.participant = p'
            )
            ->where('mlu.mailingList = :mailingList')
            ->setParameter('mailingList', $mailingList)
        ;
        if ($validEmailOnly) {
            $qb->andWhere('p.email IS NOT NULL');
        }
        if ($consentInternalOnly) {
            $qb->andWhere('p.consentInternalCommunication = 1');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return array<Participant>
     */
    public function findVotersForSelection(SelectionStep $selectionStep, int $offset, int $limit): array
    {
        $subQueryBuilder = $this->createQueryBuilder('pv');
        $subQuery = $subQueryBuilder->select('IDENTITY(participantVote.participant)')
            ->from('CapcoAppBundle:ProposalSelectionVote', 'participantVote')
            ->where('participantVote.selectionStep = :selectionStep')
            ->andWhere('participantVote.isAccounted = 1')
            ->getDQL()
        ;

        $queryBuilder = $this->createQueryBuilder('participant');
        $query = $queryBuilder->select('participant')
            ->where(
                $queryBuilder->expr()->in('participant.id', $subQuery)
            )
            ->setParameter('selectionStep', $selectionStep)
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
        ;

        return $query->getResult();
    }

    /**
     * @return array<Participant>
     */
    public function findVotersForCollect(CollectStep $collectStep, int $offset, int $limit): array
    {
        $subQueryBuilder = $this->createQueryBuilder('pv');
        $subQuery = $subQueryBuilder->select('IDENTITY(participantVote.participant)')
            ->from('CapcoAppBundle:ProposalCollectVote', 'participantVote')
            ->where('participantVote.collectStep = :collectStep')
            ->andWhere('participantVote.isAccounted = 1')
            ->getDQL()
        ;

        $queryBuilder = $this->createQueryBuilder('participant');
        $query = $queryBuilder->select('participant')
            ->where(
                $queryBuilder->expr()->in('participant.id', $subQuery)
            )
            ->setParameter('collectStep', $collectStep)
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
        ;

        return $query->getResult();
    }

    public function hasNewParticipantsForASelectionStep(SelectionStep $selectionStep, \DateTime $mostRecentFileModificationDate): bool
    {
        $qb = $this->createQueryBuilder('p')
            ->select('COUNT(DISTINCT p.id)')
            ->join('CapcoAppBundle:ProposalSelectionVote', 'pv', 'WITH', 'pv.participant = p.id')
            ->where('pv.createdAt > :date OR p.updatedAt > :date')
            ->andWhere('pv.selectionStep = :selectionStep')
        ;

        $qb->setParameters([
            'selectionStep' => $selectionStep->getId(),
            'date' => $mostRecentFileModificationDate->format('Y-m-d H:i:s'),
        ]);

        return ($qb->getQuery()->getSingleScalarResult() ?? 0) > 0;
    }

    public function hasNewParticipantsForACollectStep(CollectStep $collectStep, \DateTime $mostRecentFileModificationDate): bool
    {
        $qb = $this->createQueryBuilder('p')
            ->select('COUNT(DISTINCT p.id)')
            ->join('CapcoAppBundle:ProposalCollectVote', 'pv', 'WITH', 'pv.participant = p.id')
            ->where('pv.createdAt > :date OR p.updatedAt > :date')
            ->andWhere('pv.collectStep = :collectStep')
        ;

        $qb->setParameters([
            'collectStep' => $collectStep->getId(),
            'date' => $mostRecentFileModificationDate->format('Y-m-d H:i:s'),
        ]);

        return ($qb->getQuery()->getSingleScalarResult() ?? 0) > 0;
    }

    private function findWithRepliesQueryBuilder(Project $project, ?QuestionnaireStep $step = null, ?string $term = null): QueryBuilder
    {
        $qb = $this->createQueryBuilder('p')
            ->join('p.replies', 'r')
            ->join('r.questionnaire', 'q')
            ->join('q.step', 's')
            ->join('s.projectAbstractStep', 'pas')
            ->where('pas.project = :project')
            ->andWhere('r.participant IS NOT NULL')
            ->setParameter('project', $project)
            ->orderBy('p.createdAt', 'DESC')
        ;

        if ($term) {
            $qb->andWhere('p.firstname LIKE :term OR p.lastname LIKE :term OR p.email LIKE :term')
                ->setParameter('term', '%' . $term . '%')
            ;
        }

        if ($step) {
            $qb->andWhere('s.step = :step');
            $qb->setParameter('step', $step);
        }

        return $qb;
    }

    private function findByMediatorQueryBuilder(Mediator $mediator, ?string $fullname = null): QueryBuilder
    {
        $step = $mediator->getStep();

        $qb = $this->createQueryBuilder('p')
            ->join('p.mediatorParticipantSteps', 'mps')
            ->where('mps.step = :step')
            ->andWhere('mps.mediator = :mediator')
            ->setParameter('step', $step)
            ->setParameter('mediator', $mediator)
        ;

        if ($fullname) {
            $qb->andWhere("CONCAT(p.firstname, ' ', p.lastname) LIKE :fullname")
                ->setParameter('fullname', "%{$fullname}%")
            ;
        } else {
            $qb->orderBy('p.createdAt');
        }

        return $qb;
    }
}
