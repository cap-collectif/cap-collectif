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
     * @return mixed
     */
    public function getAllOrderedByPosition()
    {
        $qb = $this->createQueryBuilder('s')
            ->orderBy('s.position', 'ASC');

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
