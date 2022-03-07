<?php

namespace Capco\AppBundle\Repository\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVoteToken;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * @method DebateVoteToken|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateVoteToken|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateVoteToken[]    findAll()
 * @method DebateVoteToken[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateVoteTokenRepository extends EntityRepository
{
    public function getUserDebateToken(User $user, Debate $debate): ?DebateVoteToken
    {
        return $this->findOneBy([
            'user' => $user,
            'debate' => $debate,
        ]);
    }
}
