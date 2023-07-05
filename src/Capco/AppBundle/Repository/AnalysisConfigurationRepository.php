<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|AnalysisConfiguration find($id, $lockMode = null, $lockVersion = null)
 * @method null|AnalysisConfiguration findOneBy(array $criteria, array $orderBy = null)
 * @method AnalysisConfiguration[]    findAll()
 * @method AnalysisConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AnalysisConfigurationRepository extends EntityRepository
{
    public function findNotProcessedAnalysisConfiguration(?\DateTime $to): iterable
    {
        if (!isset($to)) {
            $to = new \DateTime();
        }
        $from = clone $to;
        $from->modify('-2 hours');
        $qb = $this->createQueryBuilder('c');
        $qb = $qb
            //We considered all analysis not processed which have an effectiveDate already passed
            ->andWhere($qb->expr()->between('c.effectiveDate', ':from', ':to'))
            ->andWhere('c.effectiveDateProcessed = 0')
            ->andWhere('c.proposalForm IS NOT NULL')
            ->leftJoin('c.proposalForm', 'proposalForm')
            ->setParameters([
                'from' => $from,
                'to' => $to,
            ])
            ->getQuery()
        ;

        return $qb->getResult();
    }
}
