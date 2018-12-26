<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Source;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\SourceVote;
use Doctrine\ORM\Tools\Pagination\Paginator;
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
                array_filter($project->getRealSteps(), function ($step) {
                    return $step->isConsultationStep();
                })
            )
            ->andWhere('v.user = :author')
            ->setParameter('author', $author);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
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

    public function getByContribution(Source $source, ?int $limit, ?int $offset): Paginator
    {
        $qb = $this->getPublishedQueryBuilder()
            ->andWhere('v.source = :source')
            ->setParameter('source', $source)
            ->orderBy('v.publishedAt', 'ASC');

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countByContribution(Source $source): int
    {
        return $this->getPublishedQueryBuilder()
            ->select('COUNT(v.id)')
            ->andWhere('v.source = :source')
            ->setParameter('source', $source)
            ->getQuery()
            ->getSingleScalarResult();
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
