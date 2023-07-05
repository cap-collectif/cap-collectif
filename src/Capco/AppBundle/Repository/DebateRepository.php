<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|Debate find($id, $lockMode = null, $lockVersion = null)
 * @method null|Debate findOneBy(array $criteria, array $orderBy = null)
 * @method Debate[]    findAll()
 * @method Debate[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateRepository extends EntityRepository
{
    public function findAllIds(): array
    {
        return array_column(
            $this->createQueryBuilder('debate')
                ->select('debate.id')
                ->getQuery()
                ->getArrayResult(),
            'id'
        );
    }
}
