<?php

namespace Capco\UserBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * UserRepository.
 */
class UserRepository extends EntityRepository
{
    public function findConsultationContributors($consultation)
    {
        $qb = $this->createQueryBuilder('u');
            $qb->select('distinct u.id')
            ->leftJoin('u.arguments', 'arguments')
            ->leftJoin('u.opinions', 'opinions')
            ->leftJoin('arguments.opinion', 'arguments_opinion')
            ->where($qb->expr()->orX(
                $qb->expr()->eq('arguments_opinion.Consultation', ':consultation'),
                $qb->expr()->eq('opinions.Consultation', ':consultation')
            ))
            ->setParameter('consultation', $consultation)
        ;
        return $qb->getQuery()->getResult();
    }
}
