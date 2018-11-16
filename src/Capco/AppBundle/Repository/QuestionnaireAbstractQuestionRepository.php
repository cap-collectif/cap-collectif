<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class QuestionnaireAbstractQuestionRepository extends EntityRepository
{
    public function getCurrentMaxPositionForQuestionnaire(string $id): int
    {
        $qb = $this->createQueryBuilder('n');
        $qb
            ->select('COALESCE(MAX(n.position),0)')
            ->where('n.questionnaire = :questionnaire')
            ->setParameter('questionnaire', $id);
        $query = $qb->getQuery();
        $query->useQueryCache(false);
        $query->useResultCache(false);

        return $query->getSingleScalarResult();
    }

    public function getCurrentMaxPositionForRegistrationForm(string $id): int
    {
        $qb = $this->createQueryBuilder('qaq');
        $qb
            ->select('COALESCE(MAX(qaq.position),0)')
            ->where('qaq.registrationForm = :registrationForm')
            ->setParameter('registrationForm', $id);
        $query = $qb->getQuery();
        $query->useQueryCache(false);
        $query->useResultCache(false);

        return $query->getSingleScalarResult();
    }


    public function getCurrentMaxPositionForProposalForm(string $id): int
    {
        $qb = $this->createQueryBuilder('qaq');
        $qb
            ->select('COALESCE(MAX(qaq.position),0)')
            ->where('qaq.proposalForm = :proposalForm')
            ->setParameter('proposalForm', $id);
        $query = $qb->getQuery();
        $query->useQueryCache(false);
        $query->useResultCache(false);

        return $query->getSingleScalarResult();
    }
}
