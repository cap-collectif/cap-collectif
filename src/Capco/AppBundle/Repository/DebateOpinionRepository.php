<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Debate\DebateOpinion;

/**
 * @method DebateOpinion|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateOpinion|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateOpinion[]    findAll()
 * @method DebateOpinion[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateOpinionRepository extends EntityRepository
{
    public function getByDebate(Debate $debate, int $limit, int $offset): Paginator
    {
        $qb = $this->createQueryBuilder('o')
            ->andWhere('o.debate = :debate')
            ->setParameter('debate', $debate);

        $qb->setFirstResult($offset);
        $qb->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countByDebate(Debate $debate): int
    {
        $qb = $this->createQueryBuilder('o')
            ->select('COUNT(o)')
            ->andWhere('o.debate = :debate')
            ->setParameter('debate', $debate);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
