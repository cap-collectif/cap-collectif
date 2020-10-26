<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Doctrine\ORM\EntityRepository;

/**
 * @method DebateArgument|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateArgument|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateArgument[]    findAll()
 * @method DebateArgument[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateArgumentRepository extends EntityRepository
{
}
