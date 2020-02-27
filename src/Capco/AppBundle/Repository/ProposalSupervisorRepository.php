<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * @method findBySupervisor(\Capco\UserBundle\Entity\User $user, array $array, int $limit, int $offset)
 */
class ProposalSupervisorRepository extends EntityRepository
{
}
