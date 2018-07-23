<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\ConsultationStepType;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;

/**
 * OpinionTypeRepository.
 */
class OpinionTypeRepository extends EntityRepository
{
    public function childrenHierarchy(OpinionType $parent)
    {
        $children = $this->getChildren($parent);
        foreach ($children as &$child) {
            $child['__children'] = $this->childrenHierarchy($this->find($child['id']));
        }

        return $children;
    }

    public function getAsArrayById(string $id)
    {
        $qb = $this->createQueryBuilder('ot')
            ->where('ot.id = :id')
            ->setParameter('id', $id);
        return $qb->getQuery()->getSingleResult(Query::HYDRATE_ARRAY);
    }

    public function getChildren(OpinionType $parent)
    {
        $qb = $this->createQueryBuilder('ot')
            ->andWhere('ot.parent = :parent')
            ->orderBy('ot.position', 'ASC')
            ->setParameter('parent', $parent);
        return $qb->getQuery()->getArrayResult();
    }

    public function getOrderedRootNodesQuery(ConsultationStepType $stepType = null)
    {
        $qb = $this->createQueryBuilder('ot')
            ->andWhere('ot.parent is NULL')
            ->orderBy('ot.position', 'ASC');
        if ($stepType) {
            $qb->andWhere('ot.consultationStepType = :ct')->setParameter('ct', $stepType);
        } else {
            $qb->andWhere('ot.consultationStepType IS NULL');
        }

        return $qb->getQuery();
    }

    /**
     * Get all opinionTypes with opinions for user.
     *
     * @param $user
     *
     * @return array
     */
    public function getByUser($user)
    {
        $qb = $this->createQueryBuilder('ot')
            ->addSelect('o', 's', 'pas', 'p')
            ->leftJoin('ot.Opinions', 'o')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('s.isEnabled = :enabled')
            ->andWhere('o.isEnabled = :enabled')
            ->andWhere('o.Author = :author')
            ->setParameter('enabled', true)
            ->setParameter('author', $user)
            ->orderBy('ot.position', 'ASC')
            ->addOrderBy('o.createdAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Count all opinionTypes with opinions for user.
     *
     * @param $user
     *
     * @return array
     */
    public function countByUser($user)
    {
        $qb = $this->createQueryBuilder('ot')
            ->addSelect('o', 's', 'cas', 'p')
            ->join('ot.Opinions', 'o')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->addGroupBy('ot.id')
            ->andWhere('o.Author = :author')
            ->andWhere('o.isEnabled = :enabled')
            ->andWhere('s.isEnabled = :enabled')
            ->setParameter('enabled', true)
            ->setParameter('author', $user)
            ->orderBy('ot.position', 'ASC')
            ->addOrderBy('o.createdAt', 'DESC');

        return $qb->getQuery()->getScalarResult();
    }

    /**
     * Get all opinionTypes with opinions count for consultation step.
     *
     * @param $step
     * @param $allowedTypes
     *
     * @return array
     */
    public function getAllowedTypesWithOpinionCount(ConsultationStep $step, $allowedTypes)
    {
        $qb = $this->createQueryBuilder('ot')
            ->select(
                'ot.id',
                'ot.title',
                'ot.color',
                'ot.isEnabled',
                'ot.slug',
                'ot.defaultFilter',
                'count(o.id) as total_opinions_count'
            )
            ->leftJoin(
                'ot.Opinions',
                'o',
                'WITH',
                'o.isEnabled = :enabled AND o.step = :step AND o.trashedAt IS NULL'
            )
            ->andWhere('ot IN (:allowedTypes)')
            ->setParameter('step', $step)
            ->setParameter('enabled', true)
            ->setParameter('allowedTypes', $allowedTypes)
            ->addGroupBy('ot')
            ->orderBy('ot.position', 'ASC');
        return $qb->getQuery()->getArrayResult();
    }

    /**
     * Get all opinionTypes.
     *
     * @return array
     */
    public function getOrderedByPosition()
    {
        $qb = $this->createQueryBuilder('ot')->orderBy('ot.position', 'ASC');

        return $qb->getQuery()->getResult();
    }

    public function getRootOpinionTypes()
    {
        $qb = $this->createQueryBuilder('ot')
            ->where('ot.parent IS NULL')
            ->orderBy('ot.position', 'ASC');
        return $qb->getQuery()->getResult();
    }

    public function getLinkableOpinionTypesForConsultationStepType(
        ConsultationStepType $consultationStepType
    ) {
        $qb = $this->createQueryBuilder('ot')
            ->addSelect('otat', 'at')
            ->leftJoin('ot.appendixTypes', 'otat')
            ->leftJoin('otat.appendixType', 'at')
            ->andWhere('ot.isEnabled = :enabled')
            ->andWhere('ot.linkable = :linkable')
            ->andWhere('ot.consultationStepType = :type')
            ->setParameter('enabled', true)
            ->setParameter('linkable', true)
            ->setParameter('type', $consultationStepType);
        return $qb->getQuery()->getResult();
    }
}
