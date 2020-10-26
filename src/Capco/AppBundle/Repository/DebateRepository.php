<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\ORM\EntityRepository;

/**
 * @method Debate|null find($id, $lockMode = null, $lockVersion = null)
 * @method Debate|null findOneBy(array $criteria, array $orderBy = null)
 * @method Debate[]    findAll()
 * @method Debate[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateRepository extends EntityRepository
{
}
