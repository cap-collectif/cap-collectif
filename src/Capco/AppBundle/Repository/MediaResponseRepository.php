<?php
namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Doctrine\ORM\QueryBuilder;

class MediaResponseRepository extends EntityRepository
{
    public function countParticipantsByQuestion(MediaQuestion $question): ?int
    {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(DISTINCT reply.author)')
            ->leftJoin('r.question', 'question')
            ->leftJoin('r.reply', 'reply')
            ->andWhere('question.id = :question')
            ->setParameter('question', $question);
        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByQuestion(MediaQuestion $question): int
    {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(r.id)')
            ->leftJoin('r.question', 'question')
            ->andWhere('question.id = :question')
            ->setParameter('question', $question);
        return $qb->getQuery()->getSingleScalarResult();
    }

    private function getNoEmptyResultQueryBuilder(): QueryBuilder
    {
        return // Some fixes until we use a proper JSON query
            $this->createQueryBuilder('r')
                // TODO: This only works for question on a reply
                // We must support responses on a proposal/other object
                ->leftJoin('r.reply', 'reply')
                ->andWhere('reply.draft = false')

                ->leftJoin('r.medias', 'media')
                ->andWhere('media.id IS NOT NULL')
            ;
    }
}
