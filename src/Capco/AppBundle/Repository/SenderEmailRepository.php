<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SenderEmail;
use Doctrine\ORM\EntityRepository;

/**
 * @method SenderEmail|null find($id, $lockMode = null, $lockVersion = null)
 * @method SenderEmail|null findOneBy(array $criteria, array $orderBy = null)
 * @method SenderEmail[]    findAll()
 * @method SenderEmail[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SenderEmailRepository extends EntityRepository
{
    public function getDefault(): SenderEmail 
    {
        return $this->findOneBy([
            "isDefault" => true
        ]);
    }
}
