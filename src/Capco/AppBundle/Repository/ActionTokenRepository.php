<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ActionToken;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|ActionToken find($id, $lockMode = null, $lockVersion = null)
 * @method null|ActionToken findOneBy(array $criteria, array $orderBy = null)
 * @method ActionToken[]    findAll()
 * @method ActionToken[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ActionTokenRepository extends EntityRepository
{
    public function getUnusedUserActionToken(User $user, string $action): ?ActionToken
    {
        return $this->findOneBy([
            'user' => $user,
            'action' => $action,
            'consumptionDate' => null,
        ]);
    }

    public function getUserActionToken(User $user, string $action): ?ActionToken
    {
        return $this->findOneBy([
            'user' => $user,
            'action' => $action,
        ]);
    }
}
