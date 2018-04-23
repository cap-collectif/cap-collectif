<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class QuestionnaireAbstractQuestionRepository extends EntityRepository
{
    public function getCurrentMaxPositionForQuestionnaire(string $id): int
    {
        $qb = $this->createQueryBuilder('n');
        $qb->select('COALESCE(MAX(n.position),0)')
       ->where('n.questionnaire = :questionnaire')
       ->setParameter('questionnaire', $id)
    ;
        $query = $qb->getQuery();
        $query->useQueryCache(false);
        $query->useResultCache(false);

        return $query->getSingleScalarResult();
    }
}
