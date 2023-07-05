<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Psr\Log\LoggerInterface;

/**
 * @method null|DebateArgument find($id, $lockMode = null, $lockVersion = null)
 * @method null|DebateArgument findOneBy(array $criteria, array $orderBy = null)
 * @method DebateArgument[]    findAll()
 * @method DebateArgument[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateArgumentRepository extends EntityRepository
{
    private LoggerInterface $logger;

    public function setLogger(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function getByDebate(
        Debate $debate,
        int $limit,
        int $offset,
        array $filters = [],
        ?array $orderBy = null
    ): Paginator {
        $qb = $this->getByDebateQueryBuilder($debate, $filters)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;
        if ($orderBy) {
            $qb->orderBy('argument.' . $orderBy['field'], $orderBy['direction']);
        }

        return new Paginator($qb);
    }

    public function getOneByDebateAndUser(Debate $debate, User $user): ?DebateArgument
    {
        $qb = $this->getByDebateQueryBuilder($debate, [])
            ->andWhere('argument.author = :user')
            ->setParameter('user', $user)
        ;

        try {
            return $qb->getQuery()->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            $this->logger->critical(
                'A user has multiple arguments on a debate. This should not happen.',
                ['debate' => $debate, 'user' => $user]
            );

            return null;
        }
    }

    public function getUnpublishedByDebateAndUser(Debate $debate, User $user): ?DebateArgument
    {
        $qb = $this->getByDebateQueryBuilder($debate, [
            'isPublished' => false,
            'isTrashed' => false,
        ])
            ->andWhere('argument.author = :user')
            ->setParameter('user', $user)
        ;

        try {
            return $qb->getQuery()->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            $this->logger->critical(
                'A user has multiple arguments on a debate. This should not happen.',
                ['debate' => $debate, 'user' => $user]
            );

            return null;
        }
    }

    public function countByDebate(Debate $debate, array $filters = []): int
    {
        $query = $this->getByDebateQueryBuilder($debate, $filters)
            ->select('COUNT(argument)')
            ->getQuery()
        ;

        return (int) $query->getSingleScalarResult();
    }

    public function countByDebateAndUser(Debate $debate, User $user): int
    {
        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a)')
            ->andWhere('a.debate = :debate')
            ->andWhere('a.author = :user')
            ->setParameter('debate', $debate)
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('da');
        $qb->where('da.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    /**
     * Get all trashed or unpublished debate arguments for project.
     */
    public function getTrashedByProject(Project $project)
    {
        return $this->createQueryBuilder('da')
            ->addSelect('debate', 'author', 'media')
            ->leftJoin('da.author', 'author')
            ->leftJoin('author.media', 'media')
            ->leftJoin('da.debate', 'debate')
            ->leftJoin('debate.step', 'debate_step')
            ->leftJoin('debate_step.projectAbstractStep', 'debate_step_pas')
            ->andWhere('debate_step_pas.project = :project')
            ->andWhere('da.trashedAt IS NOT NULL')
            ->setParameter('project', $project)
            ->orderBy('da.trashedAt', 'DESC')
            ->getQuery()
            ->getResult()
        ;
    }

    private function getByDebateQueryBuilder(Debate $debate, array $filters = []): QueryBuilder
    {
        $qb = $this->createQueryBuilder('argument')
            ->where('argument.debate = :debate')
            ->setParameter('debate', $debate)
        ;
        if (isset($filters['value'])) {
            $qb->andWhere('argument.type = :value')->setParameter('value', $filters['value']);
        }

        if (isset($filters['isPublished'])) {
            if ($filters['isPublished']) {
                $qb->andWhere('argument.published = true');
            } elseif (false === $filters['isPublished']) {
                $qb->andWhere('argument.published = false');
            }
        }

        if (isset($filters['isTrashed'])) {
            if (false === $filters['isTrashed']) {
                $qb->andWhere('argument.trashedStatus IS NULL');
            } elseif ($filters['isTrashed']) {
                $qb->andWhere('argument.trashedStatus IS NOT NULL');
            }
        }

        return $qb;
    }
}
