<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\UserIdentificationCode;
use Doctrine\ORM\EntityRepository;

/**
 * @method UserIdentificationCode|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserIdentificationCode|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserIdentificationCode[]    findAll()
 * @method UserIdentificationCode[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserIdentificationCodeRepository extends EntityRepository
{
}
