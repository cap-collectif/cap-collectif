<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\EntityRepository;
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
}
