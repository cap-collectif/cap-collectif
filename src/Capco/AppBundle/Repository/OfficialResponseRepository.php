<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|OfficialResponse find($id, $lockMode = null, $lockVersion = null)
 * @method null|OfficialResponse findOneBy(array $criteria, array $orderBy = null)
 * @method OfficialResponse[]    findAll()
 * @method OfficialResponse[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class OfficialResponseRepository extends EntityRepository
{
    public function getByProposal(Proposal $proposal, bool $onlyPublished = true): ?OfficialResponse
    {
        $filters = [
            'proposal' => $proposal,
        ];
        if ($onlyPublished) {
            $filters['isPublished'] = true;
        }

        return $this->findOneBy($filters);
    }

    public function findPlanned(\DateTimeInterface $publishedAt): array
    {
        return $this->createQueryBuilder('response')
            ->where('response.isPublished = 0')
            ->AndWhere('response.publishedAt < :publishedAt')
            ->setParameter('publishedAt', $publishedAt)
            ->getQuery()
            ->getResult()
        ;
    }

    public function countPublishedBetween(\DateTime $from, \DateTime $to, string $proposalId): int
    {
        $query = $this->createQueryBuilder('response')
            ->select('COUNT(DISTINCT response)')
            ->andWhere('response.isPublished = true')
            ->leftJoin('response.proposal', 'proposal')
            ->andWhere('proposal.id = :id')
            ->setParameter('id', $proposalId)
        ;

        $query
            ->andWhere($query->expr()->between('response.publishedAt', ':from', ':to'))
            ->setParameter('from', $from)
            ->setParameter('to', $to)
        ;

        return (int) $query->getQuery()->getSingleScalarResult();
    }
}
