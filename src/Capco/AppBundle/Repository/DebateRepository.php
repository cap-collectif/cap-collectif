<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|Debate find($id, $lockMode = null, $lockVersion = null)
 * @method null|Debate findOneBy(array $criteria, array $orderBy = null)
 * @method Debate[]    findAll()
 * @method Debate[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateRepository extends EntityRepository
{
    public function findAllIds(): array
    {
        return array_column(
            $this->createQueryBuilder('debate')
                ->select('debate.id')
                ->getQuery()
                ->getArrayResult(),
            'id'
        );
    }

    public function hasNewParticipants(Debate $debate, $oldestUpdateDate): int
    {
        return $this->createQueryBuilder('debate')
            ->select('COUNT(participant.id)')
            ->join('debate.participants', 'participant')
            ->where('debate.id = :debateId')
            ->andWhere('participant.updatedAt > :oldestUpdateDate')
            ->setParameter('debateId', $debate->getId())
            ->setParameter('oldestUpdateDate', $oldestUpdateDate)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @return Debate[]
     */
    public function findDebateByAllArgumentsWithConfirmedUser(int $debateOffset, int $maxResults): array
    {
        $qb = $this->createQueryBuilder('debate');
        $qb
            ->leftJoin('debate.arguments', 'arguments')
            ->leftJoin('arguments.author', 'argumentsAuthor')
            ->leftJoin('debate.anonymousArguments', 'anonymousArguments')
            ->where(
                $qb->expr()->orX(
                    $qb->expr()->andX(
                        $qb->expr()->isNotNull('arguments.id'),
                        $qb->expr()->isNull('argumentsAuthor.confirmationToken')
                    ),
                    $qb->expr()->andX(
                        $qb->expr()->isNotNull('anonymousArguments.id'),
                        $qb->expr()->isNotNull('anonymousArguments.publishedAt'),
                    )
                )
            )
            ->setFirstResult($debateOffset)
            ->setMaxResults($maxResults)
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @return ExportableDebateContributionInterface[]
     */
    public function getDebateArgumentsAndDebateAnonymousArgumentsConfirmed(Debate $debate, int $anonymousArgumentsOffset, int $maxResults): array
    {
        $qbDebateArgument = $this->getEntityManager()->createQueryBuilder()
            ->select('a')
            ->from('CapcoAppBundle:Debate\DebateArgument', 'a')
            ->leftJoin('a.author', 'au')
            ->where('a.debate = :debate')
            ->andWhere('au.confirmationToken IS NULL')
            ->setParameter('debate', $debate)
            ->setFirstResult($anonymousArgumentsOffset)
            ->setMaxResults($maxResults)
        ;

        $arguments = $qbDebateArgument->getQuery()->getResult();
        $qbDebateAnonymousArgument = $this->_em->createQueryBuilder()
            ->select('daa')
            ->from('CapcoAppBundle:Debate\DebateAnonymousArgument', 'daa')
            ->where('daa.debate = :debate')
            ->andWhere('daa.publishedAt IS NOT NULL')
            ->setParameter('debate', $debate)
            ->setFirstResult($anonymousArgumentsOffset)
            ->setMaxResults($maxResults)
        ;

        $anonymousArguments = $qbDebateAnonymousArgument->getQuery()->getResult();

        return [...$arguments, ...$anonymousArguments];
    }

    public function hasNewArgumentsForADebate(Debate $debate, \DateTime $mostRecentFileModificationDate): bool
    {
        $qb = $this->createQueryBuilder('debate');
        $qb
            ->select('count(arguments.id) + count(anonymousArguments.id)')
            ->leftJoin('debate.arguments', 'arguments')
            ->leftJoin('debate.anonymousArguments', 'anonymousArguments')
            ->where('debate.id = :debate')
            ->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->gt('arguments.updatedAt', ':lastCheck'),
                    $qb->expr()->gt('anonymousArguments.updatedAt', ':lastCheck')
                )
            )
            ->setParameter('debate', $debate)
            ->setParameter('lastCheck', $mostRecentFileModificationDate)
        ;

        if ($qb->getQuery()->getSingleScalarResult() > 0) {
            return true;
        }

        return false;
    }
}
