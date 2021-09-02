<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalRevision;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method ProposalRevision|null find($id, $lockMode = null, $lockVersion = null)
 * @method ProposalRevision|null findOneBy(array $criteria, array $orderBy = null)
 * @method ProposalRevision[]    findAll()
 * @method ProposalRevision[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ProposalRevisionRepository extends EntityRepository
{
    public function findByStateAndExpireBefore(
        Proposal $proposal,
        ?string $state,
        ?\DateTime $expiresBefore,
        int $offset = 0,
        int $limit = 100
    ): Paginator {
        $qb = $this->createQueryBuilder('pr')
            ->leftJoin('pr.proposal', 'p')
            ->andWhere('p.id = :proposal')
            ->setParameter('proposal', $proposal);

        if ($state) {
            $qb->andWhere('pr.state = :state')->setParameter('state', $state);
        }
        if ($expiresBefore) {
            $qb->andWhere('pr.expiresAt < :expiresBefore')->setParameter(
                'expiresBefore',
                $expiresBefore
            );
        }
        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countForProposalByStateAndExpireBefore(
        Proposal $proposal,
        ?string $state,
        ?\DateTime $expiresBefore
    ): int {
        $qb = $this->createQueryBuilder('pr')
            ->select('COUNT(pr.id)')
            ->leftJoin('pr.proposal', 'p')
            ->andWhere('p.id = :proposal')
            ->setParameter('proposal', $proposal);

        if ($state) {
            $qb->andWhere('pr.state = :state')->setParameter('state', $state);
        }
        if ($expiresBefore) {
            $qb->andWhere('pr.expiresAt < :expiresBefore')->setParameter(
                'expiresBefore',
                $expiresBefore
            );
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findRevisionsPaginatedInPendingNotExpired(
        Proposal $proposal,
        int $offset = 0,
        int $limit = 100
    ): Paginator {
        $expiresAt = new \DateTime();

        $qb = $this->createQueryBuilder('pr')
            ->leftJoin('pr.proposal', 'p')
            ->andWhere('p.id = :proposal')
            ->setParameter('proposal', $proposal)
            ->andWhere('pr.state = :state')
            ->andWhere('pr.expiresAt > :expiresAt')
            ->setParameter('state', 'pending')
            ->setParameter('expiresAt', $expiresAt)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function getRevisionsInPendingNotExpired(
        Proposal $proposal,
        ProposalRevision $revision
    ): array {
        $expiresAt = new \DateTime();

        $qb = $this->createQueryBuilder('pr')
            ->leftJoin('pr.proposal', 'p')
            ->andWhere('p.id = :proposal')
            ->setParameter('proposal', $proposal)
            ->andWhere('pr.state = :state')
            ->andWhere('pr.expiresAt > :expiresAt')
            ->andWhere('pr.id != :currentRevision')
            ->setParameter('state', 'pending')
            ->setParameter('currentRevision', $revision)
            ->setParameter('expiresAt', $expiresAt);

        return $qb->getQuery()->getResult();
    }

    public function countForProposalWithRevisionsInPendingNotExpired(Proposal $proposal): int
    {
        $expiresAt = new \DateTime();
        $qb = $this->createQueryBuilder('pr')
            ->select('COUNT(pr.id)')
            ->leftJoin('pr.proposal', 'p')
            ->andWhere('p.id = :proposal')
            ->setParameter('proposal', $proposal)
            ->andWhere('pr.state = :state')
            ->andWhere('pr.expiresAt > :expiresAt')
            ->setParameter('state', 'pending')
            ->setParameter('expiresAt', $expiresAt);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countByProposal(Proposal $proposal): int
    {
        $qb = $this->createQueryBuilder('pr')
            ->select('COUNT(pr.id)')
            ->leftJoin('pr.proposal', 'p')
            ->andWhere('p.id = :proposal')
            ->setParameter('proposal', $proposal);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getRevisionsByProposalPaginated(
        Proposal $proposal,
        int $offset = 0,
        int $limit = 100
    ): Paginator {
        $qb = $this->createQueryBuilder('pr')
            ->leftJoin('pr.proposal', 'p')
            ->andWhere('p.id = :proposal')
            ->setParameter('proposal', $proposal)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }
}
