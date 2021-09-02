<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class MultipleChoiceQuestionRepository extends EntityRepository
{
    public function findMultipleChoiceQuestionsByQuestionable(string $questionnableId)
    {
        $qb = $this->createQueryBuilder('mcq');

        return $qb
            ->leftJoin('mcq.questionnaireAbstractQuestion', 'qaq')
            ->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        $qb->expr()->eq('qaq.questionnaire', ':questionnableId'),
                        $qb->expr()->eq('qaq.proposalForm', ':questionnableId'),
                        $qb->expr()->eq('qaq.registrationForm', ':questionnableId')
                    )
            )
            ->setParameter('questionnableId', $questionnableId)
            ->getQuery()
            ->getResult();
    }
}
