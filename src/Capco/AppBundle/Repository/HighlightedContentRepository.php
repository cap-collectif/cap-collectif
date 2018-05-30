<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * HighlightedContentRepository.
 */
class HighlightedContentRepository extends EntityRepository implements PositionableRepository
{
    /**
     * Get all sections ordered by position.
     *
     * @param null|mixed $limit
     *
     * @return mixed
     */
    public function getAllOrderedByPosition($limit = null)
    {
        $qb = $this->createQueryBuilder('s')
            ->orderBy('s.position', 'ASC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb
            ->getQuery()
            ->execute();
    }

    /**
     * Get all enabled sections ordered by position.
     *
     * @return mixed
     */
    public function getEnabledOrderedByPosition()
    {
        return $this->getAllOrderedByPosition();
    }
}
