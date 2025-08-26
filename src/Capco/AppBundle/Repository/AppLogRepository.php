<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AppLog;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Enum\OrderDirection;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;

/**
 * @method null|AppLog find($id, $lockMode = null, $lockVersion = null)
 * @method null|AppLog findOneBy(array $criteria, array $orderBy = null)
 * @method AppLog[]    findAll()
 * @method AppLog[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AppLogRepository extends EntityRepository
{
    /**
     * @param array{field: string|null, direction: string|null}              $direction
     * @param null|array{startedAt: \DateTime|null, endedAt: \DateTime|null} $dateRange
     *
     * @return object[]
     */
    public function search(
        array $direction,
        ?string $term = null,
        ?string $actionType = null,
        ?string $userRole = null,
        ?array $dateRange = null,
        int $first = 0,
        int $limit = 100,
    ): array {
        $qb = $this
            ->createQueryBuilder('l')
            ->distinct()
            ->select('l', 'u')
            ->join('l.user', 'u')
        ;

        if (null !== $term) {
            $orGroup = $qb->expr()->orX(
                $qb->expr()->like('l.description', ':description'),
                $qb->expr()->like('l.ip', ':ip'),
                $qb->expr()->like('u.username', ':username'),
                $qb->expr()->like('u.email', ':email')
            );

            $qb->andWhere($orGroup)
                ->setParameters([
                    ':description' => '%' . $term . '%',
                    ':ip' => '%' . $term . '%',
                    ':username' => '%' . $term . '%',
                    ':email' => '%' . $term . '%',
                ])
            ;
        }

        if (null !== $actionType) {
            $qb
                ->andWhere('l.actionType = :actionType')
                ->setParameter(':actionType', $actionType)
            ;
        }

        if (null !== $userRole) {
            $qb->leftJoin(OrganizationMember::class, 'om', 'WITH', 'om.user = u');

            $qb->andWhere(
                $qb->expr()->andX(
                    $qb->expr()->orX(
                        $qb->expr()->like('u.roles', ':userRole'),
                        'om.role = :organizationRole'
                    )
                )
            )
                ->setParameter(':userRole', '%' . $userRole . '%')
                ->setParameter(':organizationRole', $userRole)
            ;
        }

        if (isset($dateRange['startedAt'])) {
            $qb
                ->andWhere('l.createdAt >= :startedAt')
                ->setParameter(':startedAt', $dateRange['startedAt'])
            ;
        }

        if (isset($dateRange['endedAt'])) {
            $qb
                ->andWhere('l.createdAt <= :endedAt')
                ->setParameter(':endedAt', $dateRange['endedAt'])
            ;
        }

        $directionField = $direction['field'];

        $orderByField = \constant("Capco\\AppBundle\\Enum\\LogAdminOrderField::{$directionField}");

        return $qb
            ->orderBy(sprintf('l.%s', $orderByField), $direction['direction'])
            ->setFirstResult($first)
            ->setMaxResults($limit)
            ->getQuery()
            ->getArrayResult()
        ;
    }

    public function getTotalCount(): int
    {
        return (int) $this
            ->createQueryBuilder('l')
            ->select('COUNT(l)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function hasNewLogs(\DateTime $oldestUpdateDate): bool
    {
        $qbd = $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->where('l.createdAt > :oldestUpdateDate')
            ->orWhere('l.updatedAt > :oldestUpdateDate')
            ->setParameter('oldestUpdateDate', $oldestUpdateDate)
            ->getQuery()
        ;

        return $qbd->getSingleScalarResult() > 0;
    }

    public function getOldestLogDate(): \DateTime
    {
        return $this->getLogDateByOrder();
    }

    public function getNewestLogDate(): \DateTime
    {
        return $this->getLogDateByOrder(OrderDirection::DESC);
    }

    private function getLogDateByOrder(string $direction = OrderDirection::ASC): \DateTime
    {
        $qb = $this->createQueryBuilder('l')
            ->select('l.createdAt')
            ->orderBy('l.createdAt', $direction)
            ->setMaxResults(1)
        ;

        try {
            /** @var string $date */
            $date = $qb->getQuery()->getSingleScalarResult();

            return new \DateTime($date);
        } catch (NoResultException) {
            return new \DateTime();
        }
    }
}
