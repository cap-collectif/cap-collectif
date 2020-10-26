<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Doctrine\ORM\EntityRepository;

/**
 * @method DebateOpinion|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateOpinion|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateOpinion[]    findAll()
 * @method DebateOpinion[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateOpinionRepository extends EntityRepository
{
}
