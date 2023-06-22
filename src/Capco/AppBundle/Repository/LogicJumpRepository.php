<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\ORM\EntityRepository;

/**
 * @method LogicJump|null find($id, $lockMode = null, $lockVersion = null)
 * @method LogicJump|null findOneBy(array $criteria, array $orderBy = null)
 * @method LogicJump[]    findAll()
 * @method LogicJump[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class LogicJumpRepository extends EntityRepository
{
    public function findDestinationJumps(AbstractQuestion $question): iterable
    {
        return $this->createQueryBuilder('j')
            ->join('j.destination', 'd')
            ->where('j.destination = :question')
            ->setParameter('question', $question)
            ->getQuery()
            ->getResult();
    }

    public function findJumpsByQuestions(array $questionsId): array
    {
        $query = $this->createQueryBuilder('j')
            ->where('j.origin IN (:questionsId)')
            ->orWhere('j.destination IN (:questionsId)')
            ->setParameter('questionsId', $questionsId)
            ->getQuery();

        return $query->getResult();
    }
}
