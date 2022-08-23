<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\PhoneToken;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Traits\ProposalCollectVoteRepositoryTrait;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProposalCollectSmsVoteRepository extends EntityRepository
{
    use ProposalCollectVoteRepositoryTrait;

    public function getByTokenAndStep(
        CollectStep $step,
        string $token,
        int $limit = 0,
        int $offset = 0,
        ?string $field = null,
        ?string $direction = null
    ): Paginator {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.collectStep = :step')
            ->join(PhoneToken::class, 'pt', Join::WITH, 'pt.token = :token AND pt.phone = pv.phone')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.id IS NOT NULL')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('step', $step)
            ->setParameter('token', $token);

        if ($field && $direction) {
            if ('PUBLISHED_AT' === $field) {
                $qb->addOrderBy('pv.publishedAt', $direction);
            }
            if ('POSITION' === $field) {
                $qb->addOrderBy('pv.position', $direction);
            }
        }

        if ($limit > 0) {
            $qb->setMaxResults($limit);
        }
        $qb->setFirstResult($offset);

        return new Paginator($qb);
    }


    public function countByTokenAndStep(CollectStep $step, string $token): int
    {
        return $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.id)')
            ->andWhere('pv.collectStep = :step')
            ->join(PhoneToken::class, 'pt', Join::WITH, 'pt.token = :token AND pt.phone = pv.phone')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('token', $token)
            ->setParameter('step', $step)
            ->getQuery()
            ->getSingleScalarResult();
    }

}