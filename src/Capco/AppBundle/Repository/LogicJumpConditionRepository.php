<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\LogicJumpCondition;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method LogicJumpCondition|null find($id, $lockMode = null, $lockVersion = null)
 * @method LogicJumpCondition|null findOneBy(array $criteria, array $orderBy = null)
 * @method LogicJumpCondition[]    findAll()
 * @method LogicJumpCondition[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class LogicJumpConditionRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, LogicJumpCondition::class);
    }
}
