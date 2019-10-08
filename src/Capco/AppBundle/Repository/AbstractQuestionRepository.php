<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\Common\Collections\Collection;
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
}
