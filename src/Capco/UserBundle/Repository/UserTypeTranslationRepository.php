<?php

namespace Capco\UserBundle\Repository;

use Capco\UserBundle\Entity\UserTypeTranslation;
use Doctrine\ORM\EntityRepository;

/**
 * @method UserTypeTranslation|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserTypeTranslation|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserTypeTranslation[]    findAll()
 * @method UserTypeTranslation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserTypeTranslationRepository extends EntityRepository
{
}
