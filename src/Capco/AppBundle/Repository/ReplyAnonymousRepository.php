<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|ReplyAnonymous find($id, $lockMode = null, $lockVersion = null)
 * @method null|ReplyAnonymous findOneBy(array $criteria, array $orderBy = null)
 * @method ReplyAnonymous[]    findAll()
 * @method ReplyAnonymous[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class ReplyAnonymousRepository extends EntityRepository
{
    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('r');
        $qb->where('r.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    public function getEnabledByQuestionnaireAsArray(Questionnaire $questionnaire): array
    {
        $qb = $this->createQueryBuilder('replyAnonymous')
            ->andWhere('replyAnonymous.questionnaire = :questionnaire')
            ->setParameter('questionnaire', $questionnaire)
        ;

        return $qb->getQuery()->getArrayResult();
    }

    public function countAll(): int
    {
        return $this->createQueryBuilder('q')
            ->select('COUNT(q.id)')
            ->getQuery()
            ->getSingleScalarResult() ?? 0;
    }

    public function getQuestionnaireAnonymousRepliesWithDistinctEmails(Questionnaire $questionnaire, int $offset, int $limit): array
    {
        $qb = $this->createQueryBuilder('replyAnonymous')
            ->andWhere('replyAnonymous.participantEmail IS NOT NULL')
            ->andWhere('replyAnonymous.questionnaire = :questionnaire')
            ->andWhere('replyAnonymous.published = 1')
            ->setParameter('questionnaire', $questionnaire)
            ->groupBy('replyAnonymous.participantEmail')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return $qb->getQuery()->getResult();
    }

    public function hasNewAnonymousReplies(Questionnaire $questionnaire, \DateTime $oldestUpdateDate): bool
    {
        $qb = $this->createQueryBuilder('replyAnonymous')
            ->select('count(replyAnonymous.id)')
            ->andWhere('replyAnonymous.questionnaire = :questionnaire')
            ->andWhere('replyAnonymous.published = 1')
            ->andWhere('replyAnonymous.updatedAt >= :oldestUpdateDate')
            ->setParameter('questionnaire', $questionnaire)
            ->setParameter('oldestUpdateDate', $oldestUpdateDate->format('Y-m-d H:i:s'))
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }
}
