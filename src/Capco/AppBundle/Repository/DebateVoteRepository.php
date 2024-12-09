<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Enum\ForOrAgainstType;
use Capco\AppBundle\Enum\VoteOrderField;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Psr\Log\LoggerInterface;

/**
 * @method null|DebateVote find($id, $lockMode = null, $lockVersion = null)
 * @method null|DebateVote findOneBy(array $criteria, array $orderBy = null)
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
                ->setParameter('user', $user)
            ;

            return $qb->getQuery()->getOneOrNullResult();
        } catch (NonUniqueResultException) {
            $this->logger->critical(
                'A user has multiple votes on a debate. This should not happen.',
                ['debate' => $debate, 'user' => $user]
            );

            return null;
        }
    }

    public function getUnpublishedByDebateAndUser(
        Debate $debate,
        User $user,
        int $limit,
        int $offset
    ): Paginator {
        $qb = $this->getUnpublishedByDebateAndUserQB($debate, $user)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return new Paginator($qb);
    }

    public function countUnpublishedByDebateAndUser(Debate $debate, User $user): int
    {
        $qb = $this->getUnpublishedByDebateAndUserQB($debate, $user)->select('COUNT(v)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getByDebate(
        Debate $debate,
        int $limit,
        int $offset,
        array $orderBy,
        ?array $filters = []
    ): Paginator {
        $qb = $this->getByDebateAndFilters($debate, $filters);

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

    public function getPublishedByAuthor(User $author, int $limit, int $offset): Paginator
    {
        $qb = $this->getPublishedByAuthorQB($author)
            ->addOrderBy('v.publishedAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return new Paginator($qb);
    }

    public function countByDebate(Debate $debate, ?array $filters = []): int
    {
        $qb = $this->getByDebateAndFilters($debate, $filters)->select('COUNT(v)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countPublishedByAuthor(User $author): int
    {
        $qb = $this->getPublishedByAuthorQB($author)->select('COUNT(v)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function hasNewVotes(Debate $debate, \DateTime $oldestUpdateDate): int
    {
        return $this->createQueryBuilder('dv')
            ->select('COUNT(dv.id)')
            ->where('dv.debate = :debate')
            ->andWhere('dv.publishedAt > :oldestUpdateDate')
            ->setParameter('debate', $debate)
            ->setParameter('oldestUpdateDate', $oldestUpdateDate)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @return array<DebateVote>
     */
    public function getDebateVotes(Debate $debate, int $offset, int $limit): array
    {
        return $this->createQueryBuilder('v')
            ->where('v.debate = :debate')
            ->setParameter('debate', $debate)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
            ;
    }

    private function getUnpublishedByDebateAndUserQB(Debate $debate, User $user): QueryBuilder
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.published = false')
            ->andWhere('v.debate = :debate')
            ->andWhere('v.user = :user')
            ->setParameter('debate', $debate)
            ->setParameter('user', $user)
        ;
    }

    private function getByDebateAndFilters(Debate $debate, ?array $filters = []): QueryBuilder
    {
        $qb = $this->getByDebateQB($debate);

        if (isset($filters['type']) && ForOrAgainstType::isValid($filters['type'])) {
            $qb->andWhere('v.type = :type')->setParameter('type', $filters['type']);
        }

        if (isset($filters['isPublished']) && \is_bool($filters['isPublished'])) {
            $qb->andWhere('v.published = :published')->setParameter(
                'published',
                $filters['isPublished']
            );
        }

        return $qb;
    }

    private function getByDebateQB(Debate $debate): QueryBuilder
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.debate = :debate')
            ->setParameter('debate', $debate)
        ;
    }

    private function getPublishedByAuthorQB(User $author): QueryBuilder
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.user = :author')
            ->andWhere('v.published = true')
            ->setParameter('author', $author)
        ;
    }
}
