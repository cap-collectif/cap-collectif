<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

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
            ->leftJoin('ovo.consultation', 'ovoc')
            ->leftJoin('o.consultation', 'oc')
            ->andWhere('oc.step IN (:steps) OR ovoc.step IN (:steps)')
            ->setParameter(
                'steps',
                array_filter($project->getRealSteps(), fn ($step) => $step->isConsultationStep())
            )
            ->andWhere('v.user = :author')
            ->setParameter('author', $author)
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult()
        ;
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.source', 'source')
            ->leftJoin('source.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('source.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->andWhere(
                '
            (source.opinion IS NOT NULL AND oc.step = :step AND o.published = 1)
            OR
            (source.opinionVersion IS NOT NULL AND ovoc.step = :step AND ov.published = 1 AND ovo.published = 1)'
            )
            ->andWhere('v.user = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndConsultation(User $author, Consultation $consultation): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.source', 'source')
            ->leftJoin('source.opinion', 'o')
            ->leftJoin('source.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere(
                '
            (source.opinion IS NOT NULL AND o.consultation = :consultation AND o.published = 1)
            OR
            (source.opinionVersion IS NOT NULL AND ovo.consultation = :consultation AND ov.published = 1 AND ovo.published = 1)'
            )
            ->andWhere('v.user = :author')
            ->setParameter('consultation', $consultation)
            ->setParameter('author', $author)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getByContribution(Source $source, ?int $limit, ?int $offset): Paginator
    {
        $qb = $this->getPublishedQueryBuilder()
            ->andWhere('v.source = :source')
            ->setParameter('source', $source)
            ->orderBy('v.publishedAt', 'ASC')
        ;

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
            ->getSingleScalarResult()
        ;
    }

    public function getBySourceAndUser(Source $source, User $author): ?SourceVote
    {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.source = :source')
            ->andWhere('v.user = :author')
            ->setParameter('source', $source)
            ->setParameter('author', $author)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('v')->andWhere('v.published = true');
    }
}
