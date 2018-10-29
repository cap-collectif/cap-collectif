<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\ORM\EntityRepository;
use Symfony\Component\Console\Question\Question;

class AbstractResponseRepository extends EntityRepository
{
    public function getByReplyAsArray($replyId)
    {
        $qb = $this->createQueryBuilder('r')
            ->addSelect('question')
            ->leftJoin('r.question', 'question')
            ->andWhere('r.reply = :reply')
            ->setParameter('reply', $replyId);
        return $qb->getQuery()->getArrayResult();
    }

    public function getByProposal(Proposal $proposal, bool $showPrivate = false)
    {
        $qb = $this->createQueryBuilder('r')
            ->addSelect('question')
            ->leftJoin('r.question', 'question')
            ->leftJoin('question.questionnaireAbstractQuestion', 'questionnaire_abstract_question')
            ->andWhere('r.proposal = :proposal')
            ->orderBy('questionnaire_abstract_question.position', 'ASC')
            ->setParameter('proposal', $proposal->getId());
        if (!$showPrivate) {
            $qb->andWhere('question.private = false');
        }

        return $qb->getQuery()->getResult();
    }
}
