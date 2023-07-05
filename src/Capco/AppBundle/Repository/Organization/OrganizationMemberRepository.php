<?php

namespace Capco\AppBundle\Repository\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|OrganizationMember find($id, $lockMode = null, $lockVersion = null)
 * @method null|OrganizationMember findOneBy(array $criteria, array $orderBy = null)
 * @method OrganizationMember[]    findAll()
 * @method OrganizationMember[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class OrganizationMemberRepository extends EntityRepository
{
    public function findPaginatedByOrganization(
        Organization $organization,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        return $this->createQueryBuilder('o')
            ->where('o.organization = :organization')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->setParameter('organization', $organization)
            ->getQuery()
            ->getResult()
        ;
    }

    public function countByOrganization(Organization $organization): int
    {
        return $this->createQueryBuilder('o')
            ->select('COUNT(o.id)')
            ->where('o.organization = :organization')
            ->setParameter('organization', $organization)
            ->getQuery()
            ->getSingleScalarResult() ?? 0;
    }
}
