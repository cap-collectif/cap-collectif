<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class OpinionVoteRepository extends EntityRepository
{
    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.opinion', 'o')
            ->leftJoin('o.consultation', 'oc', 'WITH', 'oc.step IN (:steps)')
            ->andWhere('o.published = 1')
            ->andWhere('v.user = :author')
            ->setParameter(
                'steps',
                array_filter($project->getRealSteps(), function ($step) {
                    return $step->isConsultationStep();
                })
            )
            ->setParameter('author', $author);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function getByAuthorAndOpinion(User $author, Opinion $opinion): ?OpinionVote
    {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.opinion = :opinion')
            ->andWhere('v.user = :author')
            ->setParameter('author', $author)
            ->setParameter('opinion', $opinion);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT (DISTINCT v)')
            ->leftJoin('v.opinion', 'o')
            ->leftJoin('o.consultation', 'oc', 'WITH', 'oc.step = :step')
            ->andWhere('o.published = 1')
            ->andWhere('v.user = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getByContributionQB(Opinion $votable)
    {
        $qb = $this->getPublishedQueryBuilder();
        $qb->andWhere('v.opinion = :opinion')->setParameter('opinion', $votable->getId());

        return $qb;
    }

    public function getByContributionAndValueQB(Opinion $votable, int $value)
    {
        $qb = $this->getPublishedQueryBuilder();
        $qb
            ->andWhere('v.opinion = :opinion')
            ->setParameter('opinion', $votable->getId())
            ->andWhere('v.value = :value')
            ->setParameter('value', $value);

        return $qb;
    }

    public function countByContribution(Opinion $votable): int
    {
        $qb = $this->getByContributionQB($votable);
        $qb->select('COUNT(v.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countByContributionAndValue(Opinion $votable, int $value): int
    {
        $qb = $this->getByContributionAndValueQB($votable, $value);
        $qb->select('COUNT(v.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getByContributionAndValue(
        Opinion $votable,
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
        Opinion $votable,
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

    public function getByOpinion(
        string $opinionId,
        bool $asArray = false,
        int $limit = -1,
        int $offset = 0
    ) {
        $qb = $this->getPublishedQueryBuilder();

        if ($asArray) {
            $qb->addSelect('u as author')->leftJoin('v.user', 'u');
        }

        $qb
            ->addSelect('o')
            ->leftJoin('v.opinion', 'o')
            ->andWhere('v.opinion = :opinion')
            ->setParameter('opinion', $opinionId)
            ->orderBy('v.updatedAt', 'ASC');
        if ($limit > 0) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function getVotesCountByOpinion(Opinion $opinion)
    {
        $qb = $this->createQueryBuilder('ov');

        $qb
            ->select('count(ov.id)')
            ->where('ov.opinion = :opinion')
            ->setParameter('opinion', $opinion);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get the count of OK vote for the Opinion between date.
     */
    public function countOkVotePublishedBetweenByOpinion(
        \DateTime $from,
        \DateTime $to,
        string $opinionId
    ): int {
        return $this->countPublishedBetweenByOpinionByVote(
            $from,
            $to,
            $opinionId,
            OpinionVote::VOTE_OK
        );
    }

    /**
     * Get the count of non OK vote for the Opinion between date.
     */
    public function countNOkVotePublishedBetweenByOpinion(
        \DateTime $from,
        \DateTime $to,
        string $opinionId
    ): int {
        return $this->countPublishedBetweenByOpinionByVote(
            $from,
            $to,
            $opinionId,
            OpinionVote::VOTE_NOK
        );
    }

    /**
     * Get the count of mitige vote for the Opinion between date.
     */
    public function countMitigeVotePublishedBetweenByOpinion(
        \DateTime $from,
        \DateTime $to,
        string $opinionId
    ): int {
        return $this->countPublishedBetweenByOpinionByVote(
            $from,
            $to,
            $opinionId,
            OpinionVote::VOTE_MITIGE
        );
    }

    /**
     * countPublishedBetweenByOpinionByVote.
     */
    protected function countPublishedBetweenByOpinionByVote(
        \DateTime $from,
        \DateTime $to,
        string $opinionId,
        int $voteValue
    ): int {
        $query = $this->getPublishedQueryBuilder();
        $query
            ->select('COUNT(v.id)')
            ->andWhere($query->expr()->between('v.publishedAt', ':from', ':to'))
            ->andWhere('v.opinion = :id')
            ->andWhere('v.value = :vote')
            ->setParameters([
                'from' => $from,
                'to' => $to,
                'id' => $opinionId,
                'vote' => $voteValue,
            ]);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('v')->andWhere('v.published = true');
    }
}
