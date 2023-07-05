<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|SimpleQuestion findOneBy(array $criteria, array $orderBy = null)
 * @method null|SimpleQuestion find($id, $lockMode = null, $lockVersion = null)
 */
class SimpleQuestionRepository extends EntityRepository
{
}
