<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Doctrine\ORM\EntityRepository;

class AbstractQuestionRepository extends EntityRepository
{
    public function findByProposalForm(ProposalForm $form, ?array $sort = ['field' => 'position', 'direction' => 'ASC']): iterable
    {
        [$field, $direction] = [$sort['field'], $sort['direction']];
        $qb = $this->createQueryBuilder('aq');

        return $qb
            ->leftJoin('aq.questionnaireAbstractQuestion', 'qaq')
            ->andWhere(
                $qb->expr()->eq('qaq.proposalForm', ':proposalForm')
            )
            ->setParameter('proposalForm', $form)
            ->addOrderBy("qaq.$field", $direction)
            ->getQuery()
            ->getResult();
    }

    public function findByQuestionnaire(Questionnaire $questionnaire, ?array $sort = ['field' => 'position', 'direction' => 'ASC']): iterable
    {
        [$field, $direction] = [$sort['field'], $sort['direction']];
        $qb = $this->createQueryBuilder('aq');

        return $qb
            ->leftJoin('aq.questionnaireAbstractQuestion', 'qaq')
            ->andWhere(
                $qb->expr()->eq('qaq.questionnaire', ':questionnaire')
            )
            ->setParameter('questionnaire', $questionnaire)
            ->addOrderBy("qaq.$field", $direction)
            ->getQuery()
            ->getResult();
    }

}
