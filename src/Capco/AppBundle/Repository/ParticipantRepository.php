<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
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
        ?int $offset = null
    ): array {
        return $this->createQueryBuilder('p')
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50)
            ->getQuery()
            ->getResult()
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

    public function findWithVotes(Project $project, ?SelectionStep $step = null)
    {
        $qb = $this->findWithVotesQueryBuilder($project, $step);

        return $qb->getQuery()->getResult();
    }

    public function countWithVotes(Project $project, ?SelectionStep $step = null): int
    {
        $qb = $this->findWithVotesQueryBuilder($project, $step);
        $qb->select('COUNT(p.id)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countTotalAccountedByMediator(Mediator $mediator): int
    {
        $sql = <<<'SQL'
                        SELECT COUNT(participant.id)
                        FROM (
                                SELECT p.id
                                FROM participant p
                                JOIN votes v on p.id = v.participant_id
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
                        select count(participant.id)
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

    public function findWithVotesQueryBuilder(Project $project, ?SelectionStep $step): QueryBuilder
    {
        $qb = $this->createQueryBuilder('p')
            ->join('p.votes', 'v')
            ->join('v.selectionStep', 's')
            ->join('s.projectAbstractStep', 'pas')
            ->where('pas.project = :project')
            ->andWhere('v.participant IS NOT NULL')
            ->andWhere('v.isAccounted = true')
            ->setParameter('project', $project)
            ->orderBy('p.createdAt', 'DESC')
        ;

        if ($step) {
            $qb->andWhere('v.selectionStep = :step')
                ->setParameter('step', $step)
            ;
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

    /*
     * @param array<string, array<int, string>|string> $search
     * @return array<Participant>
     */
    /*
    public function getContributors(array $search): array
    {
        $term = $search['term'];
        $fields = $search['fields'];

        $availableFields = ['id', 'email'];

        $fields = array_filter($search['fields'], function($field) use ($availableFields) {
            return in_array($field, $availableFields);
        });

        $qb = $this->createQueryBuilder('p');

        foreach ($fields as $field) {
            $qb->orWhere('p.' . $field . ' LIKE :term')
                ->setParameter('term', '%' . $term . '%');
        }

        return $qb->getQuery()->getResult();
    }
    */
}
