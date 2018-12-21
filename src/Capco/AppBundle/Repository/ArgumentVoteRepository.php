<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ArgumentVote;
use Doctrine\ORM\Query\Expr\Join;
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
            ->leftJoin('argument.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('o.step IN (:steps) OR ovo.step IN (:steps)')
            ->setParameter(
                'steps',
                array_map(function ($step) {
                    return $step;
                }, $project->getRealSteps())
            )
            ->leftJoin('v.user', 'a', Join::WITH, 'a.id = :author')
            ->setParameter('author', $author->getId());

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.argument', 'argument')
            ->leftJoin('argument.opinion', 'o')
            ->leftJoin('argument.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere(
                '
            (argument.opinion IS NOT NULL AND o.step = :step AND o.published = 1)
            OR
            (argument.opinionVersion IS NOT NULL AND ovo.step = :step AND ov.published = 1 AND ovo.published = 1)'
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
