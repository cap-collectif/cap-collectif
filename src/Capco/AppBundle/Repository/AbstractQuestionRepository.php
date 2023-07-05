<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\ORM\EntityRepository;

class AbstractQuestionRepository extends EntityRepository
{
    public function findByProposalForm(
        ProposalForm $form,
        ?array $sort = ['field' => 'position', 'direction' => 'ASC']
    ): iterable {
        list($field, $direction) = [$sort['field'], $sort['direction']];
        $qb = $this->createQueryBuilder('aq');

        return $qb
            ->leftJoin('aq.questionnaireAbstractQuestion', 'qaq')
            ->andWhere($qb->expr()->eq('qaq.proposalForm', ':proposalForm'))
            ->setParameter('proposalForm', $form)
            ->addOrderBy("qaq.{$field}", $direction)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findByQuestionnaire(
        Questionnaire $questionnaire,
        ?array $sort = ['field' => 'position', 'direction' => 'ASC']
    ): iterable {
        list($field, $direction) = [$sort['field'], $sort['direction']];
        $qb = $this->createQueryBuilder('aq');

        return $qb
            ->leftJoin('aq.questionnaireAbstractQuestion', 'qaq')
            ->andWhere($qb->expr()->eq('qaq.questionnaire', ':questionnaire'))
            ->setParameter('questionnaire', $questionnaire)
            ->addOrderBy("qaq.{$field}", $direction)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findOneByQuestionnaireAndTitle(Questionnaire $questionnaire, string $questionTitle): AbstractQuestion
    {
        $qb = $this->createQueryBuilder('aq')
            ->join('aq.questionnaireAbstractQuestion', 'qaq')
            ->where('qaq.questionnaire = :questionnaire')
            ->andWhere('aq.title = :title')
            ->setParameter('questionnaire', $questionnaire)
            ->setParameter('title', $questionTitle)
            ;

        return $qb->getQuery()->getSingleResult();
    }

    public function findWithJumpsOrWithAlwaysJumpDestination(Questionnaire $questionnaire): array
    {
        $qb = $this->createQueryBuilder('aq')
            ->join('aq.questionnaireAbstractQuestion', 'qaq')
            ->leftJoin('aq.jumps', 'j')
            ->where('qaq.questionnaire = :questionnaire')
            ->andWhere('j.id IS NOT NULL OR aq.alwaysJumpDestinationQuestion IS NOT NULL')
            ->setParameter('questionnaire', $questionnaire)
            ;

        return $qb->getQuery()->getResult();
    }
}
