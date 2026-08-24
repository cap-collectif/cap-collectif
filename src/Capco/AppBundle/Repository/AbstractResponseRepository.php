<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Doctrine\ORM\EntityRepository;

class AbstractResponseRepository extends EntityRepository
{
    /**
     * @param list<Proposal>     $proposals
     * @param array<int, string> $questionTitlesByFormReference
     *
     * @return array<string, ValueResponse>
     */
    public function findValueResponsesByProposalId(
        array $proposals,
        array $questionTitlesByFormReference
    ): array {
        if ([] === $proposals || [] === $questionTitlesByFormReference) {
            return [];
        }

        $queryBuilder = $this->createQueryBuilder('response')
            ->addSelect('question', 'proposal', 'proposalForm')
            ->innerJoin('response.question', 'question')
            ->innerJoin('response.proposal', 'proposal')
            ->innerJoin('proposal.proposalForm', 'proposalForm')
            ->andWhere('proposal IN (:proposals)')
            ->setParameter('proposals', $proposals)
        ;
        $conditions = $queryBuilder->expr()->orX();
        foreach ($questionTitlesByFormReference as $formReference => $questionTitle) {
            $conditions->add($queryBuilder->expr()->andX(
                "proposalForm.reference = :formReference{$formReference}",
                "question.title = :questionTitle{$formReference}"
            ));
            $queryBuilder
                ->setParameter("formReference{$formReference}", $formReference)
                ->setParameter("questionTitle{$formReference}", $questionTitle)
            ;
        }

        $responsesByProposalId = [];
        foreach ($queryBuilder->andWhere($conditions)->getQuery()->getResult() as $response) {
            if (!$response instanceof ValueResponse || null === $response->getProposal()) {
                continue;
            }

            $responsesByProposalId[$response->getProposal()->getId()] = $response;
        }

        return $responsesByProposalId;
    }

    /**
     * @param list<Proposal>           $proposals
     * @param array<int, list<string>> $questionTitlesByFormReference
     *
     * @return array<string, array<string, ValueResponse>>
     */
    public function findValueResponsesByProposalIdAndQuestionTitle(
        array $proposals,
        array $questionTitlesByFormReference
    ): array {
        if ([] === $proposals || [] === $questionTitlesByFormReference) {
            return [];
        }

        $queryBuilder = $this->createQueryBuilder('response')
            ->addSelect('question', 'proposal', 'proposalForm')
            ->innerJoin('response.question', 'question')
            ->innerJoin('response.proposal', 'proposal')
            ->innerJoin('proposal.proposalForm', 'proposalForm')
            ->andWhere('proposal IN (:proposals)')
            ->setParameter('proposals', $proposals)
        ;
        $conditions = $queryBuilder->expr()->orX();
        foreach ($questionTitlesByFormReference as $formReference => $questionTitles) {
            $conditions->add($queryBuilder->expr()->andX(
                "proposalForm.reference = :structureFormReference{$formReference}",
                "question.title IN (:structureQuestionTitles{$formReference})"
            ));
            $queryBuilder
                ->setParameter("structureFormReference{$formReference}", $formReference)
                ->setParameter("structureQuestionTitles{$formReference}", $questionTitles)
            ;
        }

        $responsesByProposalIdAndQuestionTitle = [];
        foreach ($queryBuilder->andWhere($conditions)->getQuery()->getResult() as $response) {
            if (!$response instanceof ValueResponse || null === $response->getProposal()) {
                continue;
            }

            $responsesByProposalIdAndQuestionTitle[$response->getProposal()->getId()][
                $response->getQuestion()->getTitle()
            ] = $response;
        }

        return $responsesByProposalIdAndQuestionTitle;
    }

    public function getByReplyAsArray($replyId): iterable
    {
        $qb = $this->createQueryBuilder('r')
            ->addSelect('question')
            ->leftJoin('r.question', 'question')
            ->andWhere('r.reply = :reply')
            ->setParameter('reply', $replyId)
        ;

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
            ->setParameter('proposal', $proposal->getId())
        ;
        if (!$showPrivate) {
            $qb->andWhere('question.private = false');
        }

        return $qb->getQuery()->getResult();
    }

    public function getByReply(Reply $reply, bool $showPrivate = false): iterable
    {
        $qb = $this->createQueryBuilder('r')
            ->addSelect('question')
            ->leftJoin('r.question', 'question')
            ->leftJoin('question.questionnaireAbstractQuestion', 'questionnaire_abstract_question')
            ->andWhere('r.reply = :reply')
            ->orderBy('questionnaire_abstract_question.position', 'ASC')
            ->setParameter('reply', $reply->getId())
        ;
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
            ->setParameter('evaluation', $evaluation->getId())
        ;
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
