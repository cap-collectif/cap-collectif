<?php

namespace Capco\AppBundle\Repository\Synthesis;

use Doctrine\ORM\EntityRepository;

/**
 * SynthesisRepository.
 */
class SynthesisRepository extends EntityRepository
{

    /**
     * Get one synthesis by id
     *
     * @param $id
     * @return mixed
     */
    public function getOne($id)
    {
        $qb = $this->createQueryBuilder('s')
            ->addSelect('e')
            ->leftJoin('s.elements', 'e', 'WITH', 'e.parent IS NULL')
            ->where('s.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
