<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * ConsultationRepository. *.
 *
 * @method Consultation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Consultation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Consultation[]    findAll()
 * @method Consultation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ConsultationRepository extends EntityRepository
{
    public function getByConsultationStepPaginated(
        ConsultationStep $cs,
        int $offset = 0,
        int $limit = 100
    ): Paginator {
        $qb = $this->createQueryBuilder('c');

        $query = $qb
            ->andWhere($qb->expr()->eq('c.step', ':cs'))
            ->setParameter('cs', $cs)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

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
            ->getSingleScalarResult();
    }
}
