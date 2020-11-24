<?php

namespace Capco\AppBundle\Repository\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method DebateArticle|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateArticle|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateArticle[]    findAll()
 * @method DebateArticle[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateArticleRepository extends EntityRepository
{
    public function getByDebate(Debate $debate, int $limit, int $offset): Paginator
    {
        $qb = $this->createQueryBuilder('da')
            ->andWhere('da.debate = :debate')
            ->setParameter('debate', $debate);

        $qb->setFirstResult($offset);
        $qb->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countByDebate(Debate $debate): int
    {
        $qb = $this->createQueryBuilder('da')
            ->select('COUNT(da)')
            ->andWhere('da.debate = :debate')
            ->setParameter('debate', $debate);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
