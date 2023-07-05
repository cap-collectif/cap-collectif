<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AnonymousUserProposalSmsVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * @method null|AnonymousUserProposalSmsVote find($id, $lockMode = null, $lockVersion = null)
 * @method null|AnonymousUserProposalSmsVote findOneBy(array $criteria, array $orderBy = null)
 * @method AnonymousUserProposalSmsVote      []    findAll()
 * @method AnonymousUserProposalSmsVote      []    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AnonymousUserProposalSmsVoteRepository extends EntityRepository
{
    public function findByPhoneAndCollectStepWithinOneMinuteRange(
        string $phone,
        Proposal $proposal,
        CollectStep $collectStep
    ): array {
        $qb = $this->findByPhoneAndProposalWithinOneMinuteRangeQueryBuilder($phone, $proposal);
        $qb->andWhere('a.collectStep = :collectStep')->setParameter('collectStep', $collectStep);

        return $qb->getQuery()->getResult();
    }

    public function findByPhoneAndSelectionStepWithinOneMinuteRange(
        string $phone,
        Proposal $proposal,
        SelectionStep $selectionStep
    ): array {
        $qb = $this->findByPhoneAndProposalWithinOneMinuteRangeQueryBuilder($phone, $proposal);
        $qb->andWhere('a.selectionStep = :selectionStep')->setParameter(
            'selectionStep',
            $selectionStep
        );

        return $qb->getQuery()->getResult();
    }

    public function findMostRecentSmsByCollectStep(
        string $phone,
        Proposal $proposal,
        CollectStep $collectStep
    ): ?AnonymousUserProposalSmsVote {
        $qb = $this->findMostRecentSmsQueryBuilder($phone, $proposal);
        $qb->andWhere('a.collectStep = :collectStep')->setParameter('collectStep', $collectStep);

        return $qb->getQuery()->getResult()[0] ?? null;
    }

    public function findMostRecentSmsBySelectionStep(
        string $phone,
        Proposal $proposal,
        SelectionStep $selectionStep
    ): ?AnonymousUserProposalSmsVote {
        $qb = $this->findMostRecentSmsQueryBuilder($phone, $proposal);
        $qb->andWhere('a.selectionStep = :selectionStep')->setParameter(
            'selectionStep',
            $selectionStep
        );

        return $qb->getQuery()->getResult()[0] ?? null;
    }

    public function countApprovedSms(): int
    {
        $status = AnonymousUserProposalSmsVote::APPROVED;

        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->where('a.status = :status')
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    private function findByPhoneAndProposalWithinOneMinuteRangeQueryBuilder(
        string $phone,
        Proposal $proposal
    ): QueryBuilder {
        $fromDate = (new \DateTime())->modify('-1 minute')->format('Y-m-d H:i:s');
        $toDate = (new \DateTime())->format('Y-m-d H:i:s');

        return $this->createQueryBuilder('a')
            ->andWhere('a.phone = :phone')
            ->andWhere('a.proposal = :proposal')
            ->andWhere('a.createdAt BETWEEN :fromDate AND :toDate')
            ->setParameter('phone', $phone)
            ->setParameter('proposal', $proposal)
            ->setParameter('fromDate', $fromDate)
            ->setParameter('toDate', $toDate)
        ;
    }

    private function findMostRecentSmsQueryBuilder(string $phone, Proposal $proposal): QueryBuilder
    {
        return $this->createQueryBuilder('a')
            ->where('a.phone = :phone')
            ->andWhere('a.proposal = :proposal')
            ->orderBy('a.createdAt', 'DESC')
            ->setParameter('phone', $phone)
            ->setParameter('proposal', $proposal)
        ;
    }
}
