<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AbstractLogicJumpCondition;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method AbstractLogicJumpCondition|null find($id, $lockMode = null, $lockVersion = null)
 * @method AbstractLogicJumpCondition|null findOneBy(array $criteria, array $orderBy = null)
 * @method AbstractLogicJumpCondition[]    findAll()
 * @method AbstractLogicJumpCondition[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AbstractLogicJumpConditionRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, AbstractLogicJumpCondition::class);
    }
}
