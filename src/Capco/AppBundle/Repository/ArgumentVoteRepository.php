<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class ArgumentVoteRepository extends EntityRepository
{
    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getQueryBuilder()
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
            ->andWhere('v.user = :author')
            ->setParameter('author', $author);
        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getQueryBuilder()
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

    /**
     * Get enabled by consultation step.
     */
    public function getEnabledByConsultationStep(ConsultationStep $step, bool $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->leftJoin('v.argument', 'arg')
            ->leftJoin('arg.opinion', 'o')
            ->leftJoin('arg.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere(
                '
                (arg.opinion IS NOT NULL AND o.step = :step AND o.published = 1)
                OR
                (arg.opinionVersion IS NOT NULL AND ovo.step = :step AND ov.published = 1 AND ovo.published = 1)'
            )
            ->setParameter('step', $step);
        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function getByArgumentAndUser(Argument $argument, User $author): array
    {
        $qb = $this->getQueryBuilder()
            ->andWhere('v.published = true')
            ->andWhere('v.argument = :argument')
            ->andWhere('v.user = :author')
            ->setParameter('argument', $argument)
            ->setParameter('author', $author);
        return $qb->getQuery()->getResult();
    }

    /**
     * Get all by argument.
     */
    public function getAllByArgument(string $argumentId, bool $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->andWhere('v.argument = :argument')
            ->setParameter('argument', $argumentId)
            ->orderBy('v.updatedAt', 'ASC');
        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    protected function getQueryBuilder()
    {
        return $this->createQueryBuilder('v')->andWhere('v.published = true');
    }
}
