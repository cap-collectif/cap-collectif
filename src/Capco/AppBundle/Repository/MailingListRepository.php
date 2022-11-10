<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Enum\MailingListAffiliation;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * @method MailingList|null find($id, $lockMode = null, $lockVersion = null)
 * @method MailingList|null findOneBy(array $criteria, array $orderBy = null)
 * @method MailingList[]    findAll()
 * @method MailingList[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MailingListRepository extends EntityRepository
{
    public function findPaginated(
        ?int $limit,
        ?int $offset,
        ?string $search,
        array $affiliations = [],
        ?User $user = null
    ): array {
        $qb = $this->createQueryBuilder('ml')
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50)
            ->addOrderBy('ml.createdAt', 'DESC');
        if ($search) {
            $qb->andWhere('ml.name LIKE :name')->setParameter('name', "%${search}%");
        }
        if ($affiliations && \in_array(MailingListAffiliation::OWNER, $affiliations) && $user) {
            $qb->join('ml.owner', 'o');
            $qb->andWhere('ml.owner = :user');
            $qb->setParameter('user', $user);
        }

        return $qb->getQuery()->getResult();
    }

    public function getMailingListByUser(User $user): array
    {
        return $qb = $this->createQueryBuilder('ml')
            ->where(':user MEMBER OF ml.users')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    public function findPaginatedByOwner(
        Owner $owner,
        ?int $limit,
        ?int $offset,
        ?string $search
    ): array {
        $qb = $this->getByOwnerQueryBuilder($owner)
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50)
            ->addOrderBy('ml.createdAt', 'DESC');

        if ($search) {
            $qb->andWhere('ml.name LIKE :name')->setParameter('name', "%${search}%");
        }

        return $qb->getQuery()->getResult();
    }

    public function countByOwner(Owner $owner): int
    {
        return $this->getByOwnerQueryBuilder($owner)
            ->select('count(ml.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    private function getByOwnerQueryBuilder(Owner $owner): QueryBuilder
    {
        $ownerField = $owner instanceof User ? 'ml.owner' : 'ml.organizationOwner';

        return $this->createQueryBuilder('ml')
            ->where("{$ownerField} = :owner")
            ->setParameter('owner', $owner);
    }
}
