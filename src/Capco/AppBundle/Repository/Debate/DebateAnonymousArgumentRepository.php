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

    public function countByDebate(Debate $debate): int
    {
        return (int) $this->createQueryBuilder('daa')
            ->select('COUNT(daa.id)')
            ->where('daa.debate = :debate')
            ->setParameter('debate', $debate)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function countPublishedByDebate(Debate $debate): int
    {
        return (int) $this->createQueryBuilder('daa')
            ->select('COUNT(daa.id)')
            ->where('daa.debate = :debate')
            ->andWhere('daa.published = true')
            ->setParameter('debate', $debate)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function countDistinctPublishedTokensByDebate(Debate $debate): int
    {
        return (int) $this->createQueryBuilder('daa')
            ->select('COUNT(DISTINCT daa.token)')
            ->where('daa.debate = :debate')
            ->andWhere('daa.published = true')
            ->andWhere('daa.trashedStatus IS NULL')
            ->setParameter('debate', $debate)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @return list<string>
     */
    public function getDistinctTokensByDebate(Debate $debate): array
    {
        $rows = $this->createQueryBuilder('daa')
            ->select('DISTINCT daa.token AS token')
            ->where('daa.debate = :debate')
            ->setParameter('debate', $debate)
            ->getQuery()
            ->getArrayResult()
        ;

        return array_values(array_filter(array_map(static fn (array $row): ?string => $row['token'] ?? null, $rows)));
    }
}
