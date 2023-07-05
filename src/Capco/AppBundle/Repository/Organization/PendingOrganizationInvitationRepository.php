<?php

namespace Capco\AppBundle\Repository\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|PendingOrganizationInvitation find($id, $lockMode = null, $lockVersion = null)
 * @method null|PendingOrganizationInvitation findOneBy(array $criteria, array $orderBy = null)
 * @method PendingOrganizationInvitation[]    findAll()
 * @method PendingOrganizationInvitation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PendingOrganizationInvitationRepository extends EntityRepository
{
    public function findPaginatedByOrganization(
        Organization $organization,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        return $this->createQueryBuilder('p')
            ->where('p.organization = :organization')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->setParameter('organization', $organization)
            ->getQuery()
            ->getResult()
        ;
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

    public function countByEmail(string $email): int
    {
        return $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.email = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->getSingleScalarResult() ?? 0;
    }

    public function findOneByEmailOrUserAndOrganization(
        Organization $organization,
        ?User $user = null,
        ?string $email = null
    ): array {
        return $this->createQueryBuilder('p')
            ->where('p.organization = :organization')
            ->andWhere('p.user = :user')
            ->orWhere('p.email = :email')
            ->setParameters(['organization' => $organization, 'user' => $user, 'email' => $email])
            ->getQuery()
            ->getResult()
        ;
    }
}
