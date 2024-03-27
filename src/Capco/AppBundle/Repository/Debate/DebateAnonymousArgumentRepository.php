<?php

namespace Capco\AppBundle\Repository\Debate;

use Capco\AppBundle\DTO\DebateAnonymousParticipationHashData;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Doctrine\ORM\EntityRepository;

class DebateAnonymousArgumentRepository extends EntityRepository
{
    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('daa');
        $qb->where('daa.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    public function findOneByHashData(
        DebateAnonymousParticipationHashData $hashData
    ): ?DebateAnonymousArgument {
        return $this->findOneBy([
            'token' => $hashData->getToken(),
            'type' => $hashData->getType(),
        ]);
    }

    public function getDebateAnonymousArguments(Debate $debate, int $anonymousArgumentsOffset, int $maxResults): array
    {
        $qb = $this->createQueryBuilder('daa');
        $qb->where('daa.debate = :debate')
            ->setParameter('debate', $debate)
            ->setFirstResult($anonymousArgumentsOffset)
            ->setMaxResults($maxResults)
        ;

        return $qb->getQuery()->getResult();
    }
}
