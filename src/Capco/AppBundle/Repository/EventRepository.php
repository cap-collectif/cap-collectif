<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

class EventRepository extends EntityRepository
{
    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('e');
        $qb
            ->addSelect('a', 'm', 't')
            ->leftJoin('e.author', 'a')
            ->leftJoin('a.media', 'm')
            ->leftJoin('e.themes', 't')
            ->where('e.id IN (:ids)')
            ->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    /**
     * Used to index counter in ES.
     */
    public function countAllByUser(User $user): int
    {
        $qb = $this->createQueryBuilder('e');
        $qb
            ->select('count(DISTINCT e)')
            ->andWhere('e.author = :user')
            ->setParameter('user', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Maybe use elasticsearch instead of MySQL.
     * If we don't need this to index data.
     */
    public function findAllByUser(User $user, string $field = null, string $direction = null): array
    {
        $qb = $this->createQueryBuilder('e');
        $qb->andWhere('e.author = :user')->setParameter('user', $user);

        if ($field && $direction && 'START_AT' === $field) {
            $qb->addOrderBy('e.startAt', $direction);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Get one event by slug.
     */
    public function getOneBySlug(string $slug): ?Event
    {
        $qb = $this->createQueryBuilder('e')
            ->addSelect('a', 't', 'media', 'registration', 'c')
            ->leftJoin('e.author', 'a')
            ->leftJoin('e.media', 'media')
            ->leftJoin('e.themes', 't', 'WITH', 't.isEnabled = true')
            ->leftJoin('e.projects', 'c', 'WITH', 'c.visibility = :visibility')
            ->leftJoin('e.registrations', 'registration', 'WITH', 'registration.confirmed = true')
            ->andWhere('e.slug = :slug')
            ->setParameter('visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
            ->setParameter('slug', $slug);

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Used to index counter in ES.
     */
    public function countByProject(string $projectId): int
    {
        $query = $this->createQueryBuilder('e')->select('COUNT(e.id)');

        return (int) $query
            ->leftJoin('e.projects', 'p')
            ->where('p.id = :project')
            ->setParameter('project', $projectId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * @deprecated: Remove me when address migration is over.
     */
    public function getEventsWithAddress($offset = 0, $limit = 1): array
    {
        $qb = $this->createQueryBuilder('e')
            ->addSelect('e.id', 'e.address', 'e.zipCode', 'e.country', 'e.city', 'e.lat', 'e.lng')
            ->orderBy('e.createdAt', 'ASC')
            ->andWhere('e.addressJson IS NULL')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return $qb->getQuery()->getArrayResult();
    }

    /**
     * @deprecated: Remove me when address migration is over.
     */
    public function countAllWithoutJsonAddress(): int
    {
        return $this->createQueryBuilder('e')
            ->select('count(e.id)')
            ->andWhere('e.addressJson IS NULL')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getByUserAndReviewStatus(
        ?User $viewer,
        ?User $user,
        array $status,
        $offset = 0,
        $limit = 1
    ) {
        if ($viewer) {
            $user = $viewer;
        }
        $qb = $this->createQueryBuilder('e')
            ->addSelect('r')
            ->orderBy('e.createdAt', 'ASC')
            ->leftJoin('e.review', 'r')
            ->andWhere('e.author = :author')
            ->andWhere('r.status IN (:status)')
            ->setParameter('status', $status)
            ->setParameter('author', $user)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    public function countByUserAndReviewStatus(?User $viewer, ?User $user, array $status)
    {
        if ($viewer) {
            $user = $viewer;
        }
        $qb = $this->createQueryBuilder('e')
            ->select('COUNT(e)')
            ->orderBy('e.createdAt', 'ASC')
            ->leftJoin('e.review', 'r')
            ->andWhere('e.author = :author')
            ->andWhere('r.status IN (:status)')
            ->setParameter('status', $status)
            ->setParameter('author', $user);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllWithRegistration()
    {
        $qb = $this->getIsEnabledQueryBuilder();
        $qb->addSelect('e.slug, e.id')->andWhere('e.guestListEnabled = true');

        return $qb->getQuery()->getArrayResult();
    }

    protected function getIsEnabledQueryBuilder(): QueryBuilder
    {
        return $this->createQueryBuilder('e')->andWhere('e.enabled = true');
    }
}
