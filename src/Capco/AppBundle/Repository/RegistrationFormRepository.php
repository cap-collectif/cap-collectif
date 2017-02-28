<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class RegistrationFormRepository extends EntityRepository
{
    public function findCurrent()
    {
        return $this->createQueryBuilder('f')->getQuery()->getOneOrNullResult();
    }
}
