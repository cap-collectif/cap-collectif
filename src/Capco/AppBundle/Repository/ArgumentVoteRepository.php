<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Doctrine\ORM\EntityRepository;

/**
 * ArgumentVoteRepository.
 */
class ArgumentVoteRepository extends EntityRepository
{
    /**
     * Get enabled by consultation step.
     *
     * @param $step
     * @param $asArray
     *
     * @return mixed
     */
    public function getEnabledByConsultationStep(ConsultationStep $step, $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->leftJoin('v.argument', 'arg')
            ->leftJoin('arg.opinion', 'o')
            ->leftJoin('arg.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('
                (arg.opinion IS NOT NULL AND o.step = :step AND o.isEnabled = 1)
                OR
                (arg.opinionVersion IS NOT NULL AND ovo.step = :step AND ov.enabled = 1 AND ovo.isEnabled = 1)'
            )
            ->setParameter('step', $step)
        ;

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    /**
     * Get all by argument.
     *
     * @param $version
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getAllByArgument(string $argumentId, $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->andWhere('v.argument = :argument')
            ->setParameter('argument', $argumentId)
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
