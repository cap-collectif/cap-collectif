<?php

namespace Capco\AppBundle\Repository\Organization;

use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method PendingOrganizationInvitation|null find($id, $lockMode = null, $lockVersion = null)
 * @method PendingOrganizationInvitation|null findOneBy(array $criteria, array $orderBy = null)
 * @method PendingOrganizationInvitation[]    findAll()
 * @method PendingOrganizationInvitation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PendingOrganizationInvitationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PendingOrganizationInvitation::class);
    }
}
