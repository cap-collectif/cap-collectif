<?php

namespace Capco\AppBundle\Repository;

use Psr\Log\LoggerInterface;
use Doctrine\ORM\QueryBuilder;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Enum\VoteOrderField;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Enum\ForOrAgainstType;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Debate\DebateVote;

/**
 * @method DebateVote|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateVote|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateVote[]    findAll()
 * @method DebateVote[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateVoteRepository extends EntityRepository
{
    private LoggerInterface $logger;

    public function setLogger(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function getOneByDebateAndUser(Debate $debate, User $user): ?DebateVote
    {
        try {
            $qb = $this->createQueryBuilder('v')
                ->andWhere('v.debate = :debate')
                ->andWhere('v.user = :user')
                ->setParameter('debate', $debate)
                ->setParameter('user', $user);

            return $qb->getQuery()->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            $this->logger->critical(
                'A user has multiple votes on a debate. This should not happen.',
                ['debate' => $debate, 'user' => $user]
            );

            return null;
        }
    }

    public function getByDebate(
        Debate $debate,
        int $limit,
        int $offset,
        ?string $filterByType,
        array $orderBy
    ): Paginator {
        $qb = $this->getByDebateAndTypeQB($debate, $filterByType);

        if (VoteOrderField::PUBLISHED_AT === $orderBy['field']) {
            $qb->addOrderBy('v.publishedAt', $orderBy['direction']);
        }

        if (VoteOrderField::CREATED_AT === $orderBy['field']) {
            $qb->addOrderBy('v.createdAt', $orderBy['direction']);
        }

        $qb->setFirstResult($offset);
        $qb->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countByDebate(Debate $debate, ?string $filterByType = null): int
    {
        $qb = $this->getByDebateAndTypeQB($debate, $filterByType)->select('COUNT(v)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    private function getByDebateAndTypeQB(
        Debate $debate,
        ?string $filterByType = null
    ): QueryBuilder {
        $qb = $this->getByDebateQB($debate);

        if ($filterByType && ForOrAgainstType::isValid($filterByType)) {
            $qb->andWhere('v.type = :type')->setParameter('type', $filterByType);
        }

        return $qb;
    }

    private function getByDebateQB(Debate $debate): QueryBuilder
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.published = true')
            ->andWhere('v.debate = :debate')
            ->setParameter('debate', $debate);
    }
}
