<?php
namespace Capco\AppBundle\Repository;

use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;

class ValueResponseRepository extends EntityRepository
{
    public function countByQuestion(AbstractQuestion $question): int
    {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(r.id)')
            ->leftJoin('r.question', 'question')
            ->andWhere('question.id = :question')
            ->setParameter('question', $question);
        return $qb->getQuery()->getSingleScalarResult();
    }

    // TODO: This only works for question on a reply
    public function countParticipantsByQuestion(AbstractQuestion $question): ?int
    {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(DISTINCT reply.author)')
            ->leftJoin('r.question', 'question')
            ->leftJoin('r.reply', 'reply')
            ->andWhere('question.id = :question')
            ->setParameter('question', $question);
        return $qb->getQuery()->getSingleScalarResult();
    }

    private function getNoEmptyResultQueryBuilder(): QueryBuilder
    {
        return // Some fixes until we use a proper JSON query
            $this->createQueryBuilder('r')
                ->andWhere('r.value IS NOT NULL')
                ->andWhere('r.value NOT LIKE :emptyValueOne')
                ->andWhere('r.value NOT LIKE :emptyValueTwo')
                ->andWhere('r.value NOT LIKE :emptyValueTree')
                ->setParameter('emptyValueOne', '{"labels":[],"other":null}')
                ->setParameter('emptyValueTwo', '{"labels":[null],"other":null}')
                ->setParameter('emptyValueTree', 'null');
    }
}
