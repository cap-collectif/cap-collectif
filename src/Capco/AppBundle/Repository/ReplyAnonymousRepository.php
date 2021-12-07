<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Doctrine\ORM\EntityRepository;

/**
 * @method ReplyAnonymous|null find($id, $lockMode = null, $lockVersion = null)
 * @method ReplyAnonymous|null findOneBy(array $criteria, array $orderBy = null)
 * @method ReplyAnonymous[]    findAll()
 * @method ReplyAnonymous[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class ReplyAnonymousRepository extends EntityRepository
{
    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('r');
        $qb->where('r.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    public function getEnabledByQuestionnaireAsArray(Questionnaire $questionnaire): array
    {
        $qb = $this->createQueryBuilder('replyAnonymous')
            ->andWhere('replyAnonymous.questionnaire = :questionnaire')
            ->setParameter('questionnaire', $questionnaire);

        return $qb->getQuery()->getArrayResult();
    }
}
