<?php

namespace Capco\AppBundle\Repository\Organization;

use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method OrganizationMember|null find($id, $lockMode = null, $lockVersion = null)
 * @method OrganizationMember|null findOneBy(array $criteria, array $orderBy = null)
 * @method OrganizationMember[]    findAll()
 * @method OrganizationMember[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class OrganizationMemberRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, OrganizationMember::class);
    }
}
