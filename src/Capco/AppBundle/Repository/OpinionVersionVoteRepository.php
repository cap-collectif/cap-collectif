<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\Tools\Pagination\Paginator;

class OpinionVersionVoteRepository extends EntityRepository
{
    public function getByContributionQB(OpinionVersion $votable)
    {
        $qb = $this->getPublishedQueryBuilder();
        $qb->andWhere('v.opinionVersion = :opinion')->setParameter('opinion', $votable->getId());

        return $qb;
    }

    public function getByContributionAndValueQB(OpinionVersion $votable, int $value)
    {
        $qb = $this->getPublishedQueryBuilder();
        $qb
            ->andWhere('v.opinionVersion = :opinion')
            ->setParameter('opinion', $votable->getId())
            ->andWhere('v.value = :value')
            ->setParameter('value', $value);

        return $qb;
    }

    public function countByContribution(OpinionVersion $votable): int
    {
        $qb = $this->getByContributionQB($votable);
        $qb->select('COUNT(v.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countByContributionAndValue(OpinionVersion $votable, int $value): int
    {
        $qb = $this->getByContributionAndValueQB($votable, $value);
        $qb->select('COUNT(v.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getByContributionAndValue(
        OpinionVersion $votable,
        int $value,
        ?int $limit,
        ?int $first,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->getByContributionAndValueQB($votable, $value);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('v.publishedAt', $direction);
        }

        $qb->setFirstResult($first)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function getByContribution(
        OpinionVersion $votable,
        ?int $limit,
        ?int $first,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->getByContributionQB($votable);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('v.publishedAt', $direction);
        }

        $qb->setFirstResult($first)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'o')
            ->andWhere('o.step IN (:steps)')
            ->andWhere('ov.published = 1')
            ->andWhere('o.published = 1')
            ->leftJoin('v.user', 'a', Join::WITH, 'a.id = :author')
            ->setParameter(
                'steps',
                array_map(function ($step) {
                    return $step;
                }, $project->getRealSteps())
            )
            ->setParameter('author', $author->getId());

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'o')
            ->andWhere('o.step = :step')
            ->andWhere('ov.published = true')
            ->andWhere('o.published = true')
            ->andWhere('v.user = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getByAuthorAndOpinion(
        User $author,
        OpinionVersion $version
    ): ?OpinionVersionVote {
        $qb = $this->createQueryBuilder('v');
        $qb
            ->andWhere('v.opinionVersion = :version')
            ->andWhere('v.user = :author')
            ->setParameter('version', $version)
            ->setParameter('author', $author);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getByVersion(
        string $versionId,
        bool $asArray = false,
        int $limit = -1,
        int $offset = 0
    ) {
        $qb = $this->getPublishedQueryBuilder();

        if ($asArray) {
            $qb
                ->addSelect('u', 'ut')
                ->leftJoin('v.user', 'u')
                ->leftJoin('u.userType', 'ut');
        }

        $qb
            ->andWhere('v.opinionVersion = :version')
            ->setParameter('version', $versionId)
            ->orderBy('v.updatedAt', 'ASC');

        if ($limit > 0) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function getVotesCountByVersion(OpinionVersion $version)
    {
        $qb = $this->createQueryBuilder('ov');

        $qb
            ->select('count(ov.id)')
            ->where('ov.opinionVersion = :version')
            ->setParameter('version', $version);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('v')->andWhere('v.published = true');
    }
}
