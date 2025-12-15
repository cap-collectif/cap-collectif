<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * ConsultationRepository. *.
 *
 * @method null|Consultation find($id, $lockMode = null, $lockVersion = null)
 * @method null|Consultation findOneBy(array $criteria, array $orderBy = null)
 * @method Consultation[]    findAll()
 * @method Consultation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ConsultationRepository extends EntityRepository
{
    public static function createSlugCriteria(string $slug): Criteria
    {
        return Criteria::create()->andWhere(Criteria::expr()->eq('slug', $slug));
    }

    public function findOneBySlugs(
        string $stepSlug,
        string $projectSlug,
        ?string $consultationSlug = null
    ): ?Consultation {
        $qb = $this->createQueryBuilder('c');

        return $qb
            ->leftJoin('c.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere($qb->expr()->eq('c.slug', ':consultationSlug'))
            ->andWhere($qb->expr()->eq('p.slug', ':projectSlug'))
            ->andWhere($qb->expr()->eq('s.slug', ':stepSlug'))
            ->setParameters(compact('stepSlug', 'projectSlug', 'consultationSlug'))
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function getByConsultationStepPaginated(
        ConsultationStep $cs,
        int $offset = 0,
        int $limit = 100
    ): Paginator {
        $qb = $this->createQueryBuilder('c');

        $query = $qb
            ->andWhere($qb->expr()->eq('c.step', ':cs'))
            ->addOrderBy('c.position')
            ->setParameter('cs', $cs)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->orderBy('c.createdAt', 'ASC')
        ;

        return new Paginator($query);
    }

    public function countByStep(ConsultationStep $cs): int
    {
        $qb = $this->createQueryBuilder('c');

        return $qb
            ->select('count(DISTINCT c)')
            ->andWhere($qb->expr()->eq('c.step', ':cs'))
            ->setParameter('cs', $cs)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function searchByTerm(string $term): array
    {
        $qb = $this->createQueryBuilder('c');
        $qb->andWhere(
            $qb
                ->expr()
                ->andX(
                    $qb->expr()->like('c.title', $qb->expr()->literal('%' . $term . '%')),
                    $qb->expr()->isNull('c.step')
                )
        );

        return $qb->getQuery()->getResult();
    }

    public function findPaginated(
        string $orderByField = 'created_at',
        string $orderByDirection = 'ASC',
        int $offset = 0,
        int $limit = 100,
        ?string $query = null
    ): Paginator {
        $qb = $this->createQueryBuilder('c');

        if ($query) {
            $qb->andWhere('c.title LIKE :query')
                ->setParameter('query', "%{$query}%")
            ;
        }

        $query = $qb
            ->addOrderBy('c.position')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->orderBy("c.{$orderByField}", $orderByDirection)
        ;

        return new Paginator($query);
    }

    public function getByOwner(Owner $owner, int $offset, int $limit, array $options): array
    {
        return $this->getByOwnerQueryBuilder($owner, $options)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
            ;
    }

    public function countByOwner(Owner $owner, array $options): int
    {
        return $this->getByOwnerQueryBuilder($owner, $options)
            ->select('count(p.id)')
            ->getQuery()
            ->getSingleScalarResult()
            ;
    }

    private function getByOwnerQueryBuilder(Owner $owner, array $options): QueryBuilder
    {
        $ownerField = $owner instanceof User ? 'p.owner' : 'p.organizationOwner';

        $qb = $this->createQueryBuilder('p')
            ->where("{$ownerField} = :owner")
            ->setParameter('owner', $owner)
        ;

        if ($query = $options['query']) {
            $qb->andWhere('p.title LIKE :query');
            $qb->setParameter('query', "%{$query}%");
        }

        return $qb;
    }
}
