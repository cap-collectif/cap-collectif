<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Opinion;

/**
 * OpinionVersionRepository.
 */
class OpinionVersionRepository extends EntityRepository
{
    public function getEnabledByOpinion(Opinion $opinion, $offset = 0, $limit = 10, $filter = 'last')
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('o', '(o.voteCountMitige + o.voteCountOk + o.voteCountNok) as HIDDEN vnb')
            ->leftJoin('o.author', 'author')
            ->leftJoin('author.Media', 'm')
            ->leftJoin('o.votes', 'v')
            ->andWhere('o.parent = :opinion')
            ->andWhere('o.isTrashed = false')
            ->setParameter('opinion', $opinion)
        ;

        if ($filter === 'old') {
            $qb->addOrderBy('o.updatedAt', 'ASC');
        }

        if ($filter === 'last') {
            $qb->addOrderBy('o.updatedAt', 'DESC');
        }

        if ($filter === 'popular') {
            $qb->addOrderBy('vnb', 'DESC');
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }


    protected function getIsEnabledQueryBuilder($alias = 'o')
    {
        return $this->createQueryBuilder($alias)
                    ->andWhere($alias.'.enabled = true')
                ;
    }

}
