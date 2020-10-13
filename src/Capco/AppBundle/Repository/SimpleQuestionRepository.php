<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Doctrine\ORM\EntityRepository;

/**
 * @method SimpleQuestion|null findOneBy(array $criteria, array $orderBy = null)
 * @method SimpleQuestion|null find($id, $lockMode = null, $lockVersion = null)
 */
class SimpleQuestionRepository extends EntityRepository
{
}
