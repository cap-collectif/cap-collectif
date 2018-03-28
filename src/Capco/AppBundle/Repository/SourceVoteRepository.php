<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class SourceVoteRepository extends EntityRepository
{
    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getQueryBuilder()
        ->select('COUNT (DISTINCT v)')
        ->leftJoin('v.source', 'source')
        ->leftJoin('source.Opinion', 'o')
        ->leftJoin('source.opinionVersion', 'ov')
        ->leftJoin('ov.parent', 'ovo')
        ->leftJoin('o.step', 'step')
        ->leftJoin('ovo.step', 'step2')
        ->leftJoin('step.projectAbstractStep', 'pas')
        ->leftJoin('step2.projectAbstractStep', 'pas2')
        ->andWhere('pas.project = :project OR pas2.project = :project')
        ->andWhere('v.user = :author')
        ->setParameter('project', $project)
        ->setParameter('author', $author)
      ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getQueryBuilder()
        ->select('COUNT (DISTINCT v)')
        ->leftJoin('v.source', 'source')
        ->leftJoin('source.Opinion', 'o')
        ->leftJoin('source.opinionVersion', 'ov')
        ->leftJoin('ov.parent', 'ovo')
        ->andWhere('
            (source.Opinion IS NOT NULL AND o.step = :step AND o.isEnabled = 1)
            OR
            (source.opinionVersion IS NOT NULL AND ovo.step = :step AND ov.enabled = 1 AND ovo.isEnabled = 1)'
        )
        ->andWhere('v.user = :author')
        ->setParameter('step', $step)
        ->setParameter('author', $author)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get enabled by consultation step.
     */
    public function getEnabledByConsultationStep(ConsultationStep $step, bool $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->leftJoin('v.source', 'source')
            ->leftJoin('source.Opinion', 'o')
            ->leftJoin('source.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('
                (source.Opinion IS NOT NULL AND o.step = :step AND o.isEnabled = 1)
                OR
                (source.opinionVersion IS NOT NULL AND ovo.step = :step AND ov.enabled = 1 AND ovo.isEnabled = 1)'
            )
            ->setParameter('step', $step)
        ;

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    /**
     * Get all by source.
     *
     * @param $sourceId
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getAllBySource($sourceId, $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->andWhere('v.source = :source')
            ->setParameter('source', $sourceId)
            ->orderBy('v.updatedAt', 'ASC')
        ;

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    protected function getQueryBuilder()
    {
        return $this->createQueryBuilder('v')
                    ->andWhere('v.expired = false')
        ;
    }
}
