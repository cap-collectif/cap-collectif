<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AbstractLogicJumpCondition;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method null|AbstractLogicJumpCondition find($id, $lockMode = null, $lockVersion = null)
 * @method null|AbstractLogicJumpCondition findOneBy(array $criteria, array $orderBy = null)
 * @method AbstractLogicJumpCondition[]    findAll()
 * @method AbstractLogicJumpCondition[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AbstractLogicJumpConditionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AbstractLogicJumpCondition::class);
    }
}
