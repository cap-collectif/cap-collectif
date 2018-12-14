<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MapToken;
use Doctrine\ORM\EntityRepository;

class MapTokenRepository extends EntityRepository
{
    public function getCurrentMapToken(): ?MapToken
    {
        return $this->createQueryBuilder('mt')
            ->getQuery()
            ->getOneOrNullResult();
    }
}
