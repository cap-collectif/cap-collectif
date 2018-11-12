<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\RegistrationForm;
use Doctrine\ORM\EntityRepository;

class RegistrationFormRepository extends EntityRepository
{
    public function findCurrent(): ?RegistrationForm
    {
        return $this->createQueryBuilder('f')->getQuery()->getOneOrNullResult();
    }
}
