<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ValueResponseRepository extends EntityRepository
{
    public function countByQuestion(
        AbstractQuestion $question,
        bool $withNotConfirmedUser = false
    ): int {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(r.id)')
            ->leftJoin('r.question', 'question')
            ->leftJoin('reply.author', 'author')
            ->andWhere('question.id = :question');
        if (!$withNotConfirmedUser) {
            $qb->andWhere(
                'author.newEmailConfirmationToken IS NULL AND author.confirmationToken IS NULL'
            );
        }
        $qb->setParameter('question', $question);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countParticipantsByQuestion(AbstractQuestion $question): ?int
    {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(DISTINCT reply.author)')
            ->leftJoin('r.question', 'question')
            ->andWhere('question.id = :question')
            ->setParameter('question', $question);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getAllByQuestion(
        AbstractQuestion $question,
        $limit = 32,
        $offset = 0,
        bool $withNotConfirmedUser = false
    ): Paginator {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->leftJoin('r.question', 'question')
            ->leftJoin('reply.author', 'author')
            ->andWhere('question.id = :question');
        if (!$withNotConfirmedUser) {
            $qb->andWhere(
                'author.newEmailConfirmationToken IS NULL AND author.confirmationToken IS NULL'
            );
        }
        $qb->setParameter('question', $question);

        $query = $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->useQueryCache(true); // ->useResultCache(true, 60)

        return new Paginator($query);
    }

    private function getNoEmptyResultQueryBuilder(): QueryBuilder
    {
        return // Some fixes until we use a proper JSON query
            // TODO: This only works for question on a reply
            // We must support responses on a proposal/other object
            $this->createQueryBuilder('r')
                ->leftJoin('r.reply', 'reply')
                ->andWhere('(reply.draft = false')
                ->andWhere('r.value IS NOT NULL')
                ->andWhere('r.value NOT LIKE :emptyValueOne')
                ->andWhere('r.value NOT LIKE :emptyValueTwo')
                ->andWhere('r.value NOT LIKE :emptyValueTree)')
                ->setParameter('emptyValueOne', '{"labels":[],"other":null}')
                ->setParameter('emptyValueTwo', '{"labels":[null],"other":null}')
                ->setParameter('emptyValueTree', 'null');
    }
}
