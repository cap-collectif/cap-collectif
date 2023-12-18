<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|Mediator find($id, $lockMode = null, $lockVersion = null)
 * @method null|Mediator findOneBy(array $criteria, array $orderBy = null)
 * @method Mediator[]    findAll()
 * @method Mediator[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MediatorRepository extends EntityRepository
{
    public function findByUsernameAndStep(string $username, AbstractStep $step): array
    {
        $qb = $this->createQueryBuilder('m')
            ->join('m.user', 'u')
            ->where('u.username LIKE :username')
            ->andWhere('m.step = :step')
            ->setParameter('step', $step)
            ->setParameter('username', "%{$username}%")
        ;

        return $qb->getQuery()->getResult();
    }
}
