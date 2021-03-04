<?php

namespace Capco\AppBundle\Repository\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Doctrine\ORM\EntityRepository;

/**
 * @method DebateAnonymousVote|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateAnonymousVote|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateAnonymousVote[]    findAll()
 * @method DebateAnonymousVote[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateAnonymousVoteRepository extends EntityRepository
{
    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('dav');
        $qb->where('dav.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }
}
