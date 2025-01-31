<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\QuestionnaireStep;

/**
 * @method null|QuestionnaireStep find($id, $lockMode = null, $lockVersion = null)
 * @method null|QuestionnaireStep findOneBy(array $criteria, array $orderBy = null)
 * @method QuestionnaireStep[]    findAll()
 * @method QuestionnaireStep[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class QuestionnaireStepRepository extends AbstractStepRepository
{
    /**
     * @return QuestionnaireStep[]
     */
    public function findAllNotEmpty(): array
    {
        $qb = $this->createQueryBuilder('qs')
            ->select('qs', 'q', 'questions')
            ->join('qs.questionnaire', 'q')
            ->innerJoin('q.questions', 'questions')
        ;

        return $qb->getQuery()->getResult();
    }
}
