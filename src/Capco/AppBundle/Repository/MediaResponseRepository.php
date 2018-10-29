<?php
namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Questions\MediaQuestion;

class MediaResponseRepository extends EntityRepository
{
    public function countParticipantsByQuestion(MediaQuestion $question): ?int
    {
        $qb = $this->createQueryBuilder('r')
            ->select('COUNT(DISTINCT reply.author)')
            ->leftJoin('r.question', 'question')
            ->leftJoin('r.reply', 'reply')
            ->andWhere('question.id = :question')
            ->setParameter('question', $question);
        return $qb->getQuery()->getSingleScalarResult();
    }
}
