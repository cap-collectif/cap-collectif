<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class GlobalDistrictRepository extends EntityRepository implements SluggableRepositoryInterface
{
    public function findByIds(array $ids): array
    {
        $query = $this->createQueryBuilder('d');
        $query
            ->andWhere('d.id IN (:ids)')
            ->leftJoin('d.translations', 'dt')
            ->setParameter('ids', $ids)
        ;

        return $query->getQuery()->getResult();
    }

    public function getWithPagination(int $offset, int $limit, ?string $name = null): Paginator
    {
        $qb = $this->createQueryBuilder('d');
        $qb->leftJoin('d.translations', 'dt');
        if (null !== $name) {
            $qb->andWhere('dt.name LIKE :name')->setParameter('name', '%' . $name . '%');
        }
        $qb->orderBy('dt.name', 'ASC');
        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countAll(?string $name = null): int
    {
        $qb = $this->createQueryBuilder('d');
        $qb->select('count(d.id)');
        if (null !== $name) {
            $qb->leftJoin('d.translations', 'dt');
            $qb->andWhere('dt.name LIKE :name')->setParameter('name', '%' . $name . '%');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getBySlug(string $slug): ?GlobalDistrict
    {
        $qb = $this->createQueryBuilder('pd')
            ->leftJoin('pd.translations', 'pdt')
            ->andWhere('pdt.slug = :slug')
            ->setParameter('slug', $slug)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    // TODO remove me when project page is in React
    public function findAllOrderedByPosition(string $projectId): array
    {
        //Get all districts already associated with the project first
        $in = $this->createQueryBuilder('d')
            ->innerJoin('d.projectDistrictPositioners', 'positioner')
            ->where('positioner.project = :projectId')
            ->leftJoin('d.translations', 'dt')
            ->setParameter('projectId', $projectId)
            ->orderBy('positioner.position')
            ->getQuery()
            ->getResult()
        ;
        //Get districts not linked to the project (There are projects already appearing in $in)
        $out = $this->createQueryBuilder('d')
            ->leftJoin('d.projectDistrictPositioners', 'positioner')
            ->where('positioner.project != :projectId OR positioner IS NULL')
            ->leftJoin('d.translations', 'dt')
            ->setParameter('projectId', $projectId)
            ->getQuery()
            ->getResult()
        ;
        foreach (array_diff($out, $in) as $item) {
            $in[] = $item;
        }

        return $in;
    }

    public function findByEvent(Event $event, ?int $offset = null, ?int $limit = null): array
    {
        $qb = $this->findByEventQueryBuilder($event);

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    public function countByEvent(Event $event): int
    {
        $qb = $this->findByEventQueryBuilder($event);
        $qb->select('COUNT(d.id)');

        return $qb->getQuery()->getSingleScalarResult() ?? 0;
    }

    public function findOneByTitle(string $title): ?GlobalDistrict
    {
        $qb = $this->createQueryBuilder('d')
            ->innerJoin('d.translations', 'dt')
            ->where('dt.name LIKE :title')
            ->setParameter('title', '%' . $title . '%')
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    private function findByEventQueryBuilder(Event $event): QueryBuilder
    {
        return $this->createQueryBuilder('d')
            ->join('d.eventDistrictPositioners', 'ep')
            ->where('ep.event = :event')
            ->setParameter('event', $event)
        ;
    }
}
