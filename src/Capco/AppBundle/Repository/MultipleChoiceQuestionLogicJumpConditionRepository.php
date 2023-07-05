<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|MultipleChoiceQuestionLogicJumpCondition find($id, $lockMode = null, $lockVersion = null)
 * @method null|MultipleChoiceQuestionLogicJumpCondition findOneBy(array $criteria, array $orderBy = null)
 * @method MultipleChoiceQuestionLogicJumpCondition[]    findAll()
 * @method MultipleChoiceQuestionLogicJumpCondition[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MultipleChoiceQuestionLogicJumpConditionRepository extends EntityRepository
{
}
