<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class ContactFormRepository extends EntityRepository
{
    public function getAll(?int $limit = null): array
    {
        $qb = $this->createQueryBuilder('cf');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->execute();
    }
}
