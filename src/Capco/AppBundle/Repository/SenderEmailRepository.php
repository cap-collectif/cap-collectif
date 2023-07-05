<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SenderEmail;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|SenderEmail find($id, $lockMode = null, $lockVersion = null)
 * @method null|SenderEmail findOneBy(array $criteria, array $orderBy = null)
 * @method SenderEmail[]    findAll()
 * @method SenderEmail[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SenderEmailRepository extends EntityRepository
{
    public function getDefault(): SenderEmail
    {
        return $this->findOneBy([
            'isDefault' => true,
        ]);
    }
}
