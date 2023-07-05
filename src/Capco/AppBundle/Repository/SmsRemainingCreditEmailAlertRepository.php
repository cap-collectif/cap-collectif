<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SmsRemainingCreditEmailAlert;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|SmsRemainingCreditEmailAlert find($id, $lockMode = null, $lockVersion = null)
 * @method null|SmsRemainingCreditEmailAlert findOneBy(array $criteria, array $orderBy = null)
 * @method SmsRemainingCreditEmailAlert[]    findAll()
 * @method SmsRemainingCreditEmailAlert[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SmsRemainingCreditEmailAlertRepository extends EntityRepository
{
}
