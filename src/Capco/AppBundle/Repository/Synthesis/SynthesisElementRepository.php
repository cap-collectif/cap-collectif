<?php

namespace Capco\AppBundle\Repository\Synthesis;

use Doctrine\ORM\EntityRepository;

/**
 * SynthesisElementRepository.
 */
class SynthesisElementRepository extends EntityRepository
{
    protected static $allowedFields = ['synthesis', 'enabled', 'archived', 'parent'];

    /**
     * Cout elements with values.
     *
     * @return int
     */
    public function countWith($values)
    {
        $qb = $this->createQueryBuilder('se')
            ->select('COUNT(se.id)')
        ;

        $qb = $this->addQueryConditions($qb, $values);

        return $qb
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get elements with values.
     *
     * @return int
     */
    public function getWith($values)
    {
        $qb = $this->createQueryBuilder('se')
            ->addSelect('a', 'am')
            ->leftJoin('se.author', 'a')
            ->leftJoin('a.Media', 'am')
        ;

        $qb = $this->addQueryConditions($qb, $values);

        return $qb
            ->getQuery()
            ->getResult();
    }

    /**
     * Add necessary where clauses to query builder.
     *
     * @param $qb
     * @param $conditions
     *
     * @return mixed
     */
    protected function addQueryConditions($qb, $conditions)
    {
        foreach ($conditions as $key => $value) {
            if (in_array($key, self::$allowedFields)) {
                $qb = $this->addQueryCondition($qb, $key, $value);
            }
        }

        return $qb;
    }

    protected function addQueryCondition($qb, $field, $value)
    {
        if (in_array($field, self::$allowedFields)) {
            if ($value === null) {
                return $qb
                    ->andWhere('se.'.$field.' IS NULL');
            }

            return $qb
                ->andWhere('se.'.$field.' = :'.$field)
                ->setParameter($field, $value);
        }

        return $qb;
    }
}
