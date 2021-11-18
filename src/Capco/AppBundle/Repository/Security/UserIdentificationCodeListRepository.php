<?php

namespace Capco\AppBundle\Repository\Security;

use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Doctrine\ORM\EntityRepository;

/**
 * @method UserIdentificationCodeList|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserIdentificationCodeList|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserIdentificationCodeList[]    findAll()
 * @method UserIdentificationCodeList[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserIdentificationCodeListRepository extends EntityRepository
{
}
