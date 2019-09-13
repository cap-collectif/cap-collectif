<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ArgumentVote;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Steps\ConsultationStep;

class ArgumentVoteRepository extends EntityRepository
{
    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.argument', 'argument')
            ->leftJoin('argument.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('argument.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->andWhere('oc.step IN (:steps) OR ovoc.step IN (:steps)')
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
            ->leftJoin('v.argument', 'argument')
            ->leftJoin('argument.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('argument.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->andWhere(
                '
            (argument.opinion IS NOT NULL AND oc.step = :step AND o.published = 1)
            OR
            (argument.opinionVersion IS NOT NULL AND ovoc.step = :step AND ov.published = 1 AND ovo.published = 1)'
            )
            ->andWhere('v.user = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getByArgumentAndUser(Argument $argument, User $author): ?ArgumentVote
    {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.argument = :argument')
            ->andWhere('v.user = :author')
            ->setParameter('argument', $argument)
            ->setParameter('author', $author);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getByContribution(Argument $argument, ?int $limit, ?int $offset): Paginator
    {
        $qb = $this->getPublishedQueryBuilder()
            ->andWhere('v.argument = :argument')
            ->setParameter('argument', $argument)
            ->orderBy('v.publishedAt', 'ASC');

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countByContribution(Argument $argument): int
    {
        return $this->getPublishedQueryBuilder()
            ->select('COUNT(v.id)')
            ->andWhere('v.argument = :argument')
            ->setParameter('argument', $argument)
            ->getQuery()
            ->getSingleScalarResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('v')->andWhere('v.published = true');
    }
}
