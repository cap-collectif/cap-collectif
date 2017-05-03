<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Doctrine\ORM\EntityRepository;

/**
 * OpinionVersionVoteRepository.
 */
class OpinionVersionVoteRepository extends EntityRepository
{
    /**
     * Get enabled by consultation step.
     *
     * @param $step
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getEnabledByConsultationStep(ConsultationStep $step, $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->leftJoin('v.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'o')
            ->andWhere('o.step = :step')
            ->andWhere('ov.enabled = 1')
            ->andWhere('o.isEnabled = 1')
            ->setParameter('step', $step)
            ->orderBy('v.updatedAt', 'ASC');

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function getByVersion(string $versionId, bool $asArray = false, int $limit = -1, int $offset = 0)
    {
        $qb = $this->getQueryBuilder();

        if ($asArray) {
            $qb
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
          ;
        }

        $qb
            ->andWhere('v.opinionVersion = :version')
            ->setParameter('version', $versionId)
            ->orderBy('v.updatedAt', 'ASC');

        if ($limit > 0) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function getVotesCountByVersion(OpinionVersion $version)
    {
        $qb = $this->createQueryBuilder('ov');

        $qb->select('count(ov.id)')
          ->where('ov.opinionVersion = :version')
          ->setParameter('version', $version)
      ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    protected function getQueryBuilder()
    {
        return $this->createQueryBuilder('v')
                    ->andWhere('v.expired = false')
              ;
    }
}
