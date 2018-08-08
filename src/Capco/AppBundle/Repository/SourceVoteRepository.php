<?php
namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Source;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Entity\Steps\ConsultationStep;

class SourceVoteRepository extends EntityRepository
{
    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.source', 'source')
            ->leftJoin('source.opinion', 'o')
            ->leftJoin('source.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('o.step IN (:steps) OR ovo.step IN (:steps)')
            ->setParameter(
                'steps',
                array_map(function ($step) {
                    return $step;
                }, $project->getRealSteps())
            )
            ->andWhere('v.user = :author')
            ->setParameter('author', $author);
        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.source', 'source')
            ->leftJoin('source.opinion', 'o')
            ->leftJoin('source.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere(
                '
            (source.opinion IS NOT NULL AND o.step = :step AND o.published = 1)
            OR
            (source.opinionVersion IS NOT NULL AND ovo.step = :step AND ov.published = 1 AND ovo.published = 1)'
            )
            ->andWhere('v.user = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author);
        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get enabled by consultation step.
     */
    public function getEnabledByConsultationStep(ConsultationStep $step, bool $asArray = false)
    {
        $qb = $this->getPublishedQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->leftJoin('v.source', 'source')
            ->leftJoin('source.opinion', 'o')
            ->leftJoin('source.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere(
                '
                (source.opinion IS NOT NULL AND o.step = :step AND o.published = 1)
                OR
                (source.opinionVersion IS NOT NULL AND ovo.step = :step AND ov.published = 1 AND ovo.published = 1)'
            )
            ->setParameter('step', $step);
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
        $qb = $this->getPublishedQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->andWhere('v.source = :source')
            ->setParameter('source', $sourceId)
            ->orderBy('v.updatedAt', 'ASC');
        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function getBySourceAndUser(Source $source, User $author): ?SourceVote
    {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.source = :source')
            ->andWhere('v.user = :author')
            ->setParameter('source', $source)
            ->setParameter('author', $author);
        return $qb->getQuery()->getOneOrNullResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('v')->andWhere('v.published = true');
    }
}
