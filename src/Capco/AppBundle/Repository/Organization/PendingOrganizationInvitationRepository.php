<?php

namespace Capco\AppBundle\Repository\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Doctrine\ORM\EntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method PendingOrganizationInvitation|null find($id, $lockMode = null, $lockVersion = null)
 * @method PendingOrganizationInvitation|null findOneBy(array $criteria, array $orderBy = null)
 * @method PendingOrganizationInvitation[]    findAll()
 * @method PendingOrganizationInvitation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PendingOrganizationInvitationRepository extends EntityRepository
{
    public function findPaginatedByOrganization(
        Organization $organization,
        ?int $limit = null,
        ?int $offset = null
    ): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.organization = :organization')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->setParameter('organization', $organization)
            ->getQuery()
            ->getResult();
    }

    public function countByOrganization(Organization $organization): int
    {
        return $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.organization = :organization')
            ->setParameter('organization', $organization)
            ->getQuery()
            ->getSingleScalarResult() ?? 0;
    }
}
