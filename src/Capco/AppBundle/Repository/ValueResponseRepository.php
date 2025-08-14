<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
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
            ->andWhere('question.id = :question')
        ;
        if (!$withNotConfirmedUser) {
            $qb->andWhere(
                'author.newEmailConfirmationToken IS NULL AND author.confirmationToken IS NULL'
            );
        }
        $qb->setParameter('question', $question);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countParticipantsByQuestion(
        AbstractQuestion $question,
        bool $withNotConfirmedUser = false
    ): int {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(DISTINCT reply.author)')
            ->leftJoin('r.question', 'question')
            ->leftJoin('reply.author', 'author')
            ->andWhere('question.id = :question')
        ;

        if (!$withNotConfirmedUser) {
            $qb->andWhere(
                'author.newEmailConfirmationToken IS NULL AND author.confirmationToken IS NULL'
            );
        }
        $qb->setParameter('question', $question);

        return (int) $qb->getQuery()->getSingleScalarResult();
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
            ->andWhere('question.id = :question')
        ;
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
            ->useQueryCache(true)
        ;

        return new Paginator($query);
    }

    public function getAllByQuestionWithoutPaginator(
        AbstractQuestion $question,
        bool $withNotConfirmedUser = false
    ) {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->leftJoin('r.question', 'question')
            ->leftJoin('reply.author', 'author')
            ->andWhere('question.id = :question')
        ;
        if (!$withNotConfirmedUser) {
            $qb->andWhere(
                'author.newEmailConfirmationToken IS NULL AND author.confirmationToken IS NULL'
            );
        }
        $qb->setParameter('question', $question);

        $query = $qb->getQuery()->useQueryCache(true);

        return $query->getResult();
    }

    public function countByValue(int $questionId)
    {
        $qb = $this->getNoEmptyResultQueryBuilder();

        return $qb
            ->select('r.value as choice, COUNT(r.value) AS count')
            ->andWhere('r.question = :id')
            ->setParameter('id', $questionId)
            ->groupBy('r.value')
            ->orderBy('r.value', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    public function countCategories(?AbstractQuestion $question = null, ?int $limit = null): array
    {
        $qb = $this->createQueryBuilder('r')
            ->select('r.iaCategory as value')
            ->addSelect('count(r.id) as counter')
            ->andWhere('r.iaCategory IS NOT NULL')
            ->groupBy('r.iaCategory')
            ->orderBy('counter', 'DESC')
            ->setMaxResults($limit)
        ;

        if ($question) {
            $qb->andWhere('r.question = :question')->setParameter('question', $question);
        }

        return $qb->getQuery()->getArrayResult();
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
                ->setParameter('emptyValueTree', 'null')
            ;
    }
}
