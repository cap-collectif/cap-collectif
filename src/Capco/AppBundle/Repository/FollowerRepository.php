<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\Tools\Pagination\Paginator;

class FollowerRepository extends EntityRepository
{
    public function getByProposalIdsAndUser(array $ids, User $user): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.user = :user')
            ->andWhere('f.proposal IN (:ids)')
            ->setParameter('user', $user)
            ->setParameter('ids', $ids)
            ->getQuery()
            ->useQueryCache(true)
            ->getResult();
    }

    public function countFollowersOfProposal(Proposal $proposal): int
    {
        $query = $this->createQueryBuilder('f')
            ->select('count(f.id)')
            ->join('f.proposal', 'p')
            ->join('f.user', 'u')
            ->andWhere('p.id = :proposalId')
            ->setParameter('proposalId', $proposal->getId());

        return $query->getQuery()->getSingleScalarResult();
    }

    public function countFollowersOfOpinion(Opinion $opinion): int
    {
        $query = $this->createQueryBuilder('f')
            ->select('count(f.id)')
            ->join('f.opinion', 'o')
            ->join('f.user', 'u')
            ->andWhere('o.id = :opinionId')
            ->setParameter('opinionId', $opinion->getId());

        return $query->getQuery()->getSingleScalarResult();
    }

    public function countFollowersOfOpinionVersion(OpinionVersion $version): int
    {
        $qb = $this->createQueryBuilder('f');
        $qb
            ->select($qb->expr()->count('f.id'))
            ->leftJoin('f.opinionVersion', 'ov')
            ->where($qb->expr()->eq('ov.id', ':versionId'))
            ->setParameter(':versionId', $version->getId());

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getByCriteriaOrdered(
        array $criteria,
        array $orderBy,
        $limit = 32,
        $offset = 0
    ): Paginator {
        $qb = $this->createQueryBuilder('f')
            ->join('f.proposal', 'p')
            ->join('f.user', 'u');

        if (isset($criteria['proposal'])) {
            $qb
                ->andWhere('p.id = :proposalId')
                ->setParameter('proposalId', $criteria['proposal']->getId());
        }

        $sortField = array_keys($orderBy)[0];
        $direction = $orderBy[$sortField];

        switch ($sortField) {
            case 'NAME':
            case 'USERNAME':
                $qb->addOrderBy('u.username', $direction);

                break;
            case 'RANDOM':
                $qb->addSelect('RAND() as HIDDEN rand')->addOrderBy('rand');

                break;
            default:
                $qb->addOrderBy('u.username', $direction);

                break;
        }
        $query = $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->useQueryCache(true); // ->useResultCache(true, 60)
        return new Paginator($query);
    }

    public function findAllWhereProposalDeleteAtIsNull(): array
    {
        $qb = $this->createQueryBuilder('f')
            ->leftJoin('f.proposal', 'p')
            ->andWhere('p.deletedAt IS NULL')
            ->andWhere('f.proposal IS NOT NULL');

        return $qb->getQuery()->getResult();
    }

    /**
     * Find All the followers with published opinion.
     */
    public function findAllWithOpinion(): array
    {
        $qd = $this->createQueryBuilder('f')
            ->leftJoin('f.opinion', 'o')
            ->andWhere('f.opinion IS NOT NULL')
            ->andWhere('o.published = 1');

        return $qd->getQuery()->getResult();
    }
}
