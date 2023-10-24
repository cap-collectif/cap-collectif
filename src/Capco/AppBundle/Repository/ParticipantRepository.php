<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Participant;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;

/**
 * @method null|Participant find($id, $lockMode = null, $lockVersion = null)
 * @method null|Participant findOneBy(array $criteria, array $orderBy = null)
 * @method Participant[]    findAll()
 * @method Participant[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ParticipantRepository extends EntityRepository
{
    public function findPaginated(
        ?int $limit = null,
        ?int $offset = null
    ): array {
        return $this->createQueryBuilder('p')
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50)
            ->getQuery()
            ->getResult()
            ;
    }

    /**
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function add(Participant $entity, bool $flush = true): void
    {
        $this->_em->persist($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }

    /**
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function remove(Participant $entity, bool $flush = true): void
    {
        $this->_em->remove($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }
}
