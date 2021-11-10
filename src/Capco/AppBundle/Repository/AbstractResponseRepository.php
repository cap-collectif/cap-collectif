<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\ReplyInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Entity\Reply;
use Doctrine\ORM\EntityRepository;

class AbstractResponseRepository extends EntityRepository
{
    public function getByReplyAsArray($replyId): iterable
    {
        $qb = $this->createQueryBuilder('r')
            ->addSelect('question')
            ->leftJoin('r.question', 'question')
            ->andWhere('r.reply = :reply')
            ->setParameter('reply', $replyId);

        return $qb->getQuery()->getArrayResult();
    }

    public function getByProposal(Proposal $proposal, bool $showPrivate = false): iterable
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

    public function getByReply(ReplyInterface $reply, bool $showPrivate = false): iterable
    {
        $qb = $this->createQueryBuilder('r')
            ->addSelect('question')
            ->leftJoin('r.question', 'question')
            ->leftJoin('question.questionnaireAbstractQuestion', 'questionnaire_abstract_question')
            ->andWhere('r.reply = :reply OR r.replyAnonymous = :reply')
            ->orderBy('questionnaire_abstract_question.position', 'ASC')
            ->setParameter('reply', $reply->getId());
        if (!$showPrivate) {
            $qb->andWhere('question.private = false');
        }

        return $qb->getQuery()->getResult();
    }

    public function getByEvaluation(
        ProposalEvaluation $evaluation,
        bool $showPrivate = false
    ): iterable {
        $qb = $this->createQueryBuilder('r')
            ->addSelect('question')
            ->leftJoin('r.question', 'question')
            ->leftJoin('question.questionnaireAbstractQuestion', 'questionnaire_abstract_question')
            ->andWhere('r.proposalEvaluation = :evaluation')
            ->orderBy('questionnaire_abstract_question.position', 'ASC')
            ->setParameter('evaluation', $evaluation->getId());
        if (!$showPrivate) {
            $qb->andWhere('question.private = false');
        }

        return $qb->getQuery()->getResult();
    }

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('r');
        $qb->where('r.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }
}
