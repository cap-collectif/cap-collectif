<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\ORM\EntityRepository;

class RequirementRepository extends EntityRepository
{
    public function getByStep(AbstractStep $step): array
    {
        $requirements = $this->createQueryBuilder('r')
            ->andWhere('r.step = :step')
            ->addOrderBy('r.position', 'ASC')
            ->setParameter('step', $step)
            ->getQuery()
            ->getResult()
        ;

        $prioritizedRequirements = array_filter($requirements, fn ($requirement) => true === \in_array($requirement->getType(), Requirement::$PRIORITIZED_REQUIREMENTS));

        if (\count($prioritizedRequirements) <= 0) {
            return $requirements;
        }

        $remainingRequirements = array_filter($requirements, fn ($requirement) => false === \in_array($requirement->getType(), Requirement::$PRIORITIZED_REQUIREMENTS));

        usort($prioritizedRequirements, function ($a, $b) {
            $aIndex = array_search($a->getType(), Requirement::$PRIORITIZED_REQUIREMENTS);
            $bIndex = array_search($b->getType(), Requirement::$PRIORITIZED_REQUIREMENTS);

            if (false !== $aIndex && false !== $bIndex) {
                return $aIndex - $bIndex;
            }

            if (false !== $aIndex || false !== $bIndex) {
                return -1;
            }

            return 0;
        });

        return array_merge($prioritizedRequirements, $remainingRequirements);
    }
}
