<?php

namespace Capco\UserBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use Capco\UserBundle\Entity\User;

/**
 * UserRepository
 */
class UserRepository extends EntityRepository
{
    public function getUserWithContributionsCount($user)
    {
        $qb = $this->createQueryBuilder('u')
            ->select('(SELECT count(v)
                        FROM Capco\AppBundle\Entity\Vote v
                        WHERE v.Voter = u)
                        AS votes')
            ->addSelect('(SELECT count(iv)
                        FROM Capco\AppBundle\Entity\IdeaVote iv
                        WHERE iv.Voter = u)
                        AS ideaVotes')
            ->addSelect('(SELECT count(av)
                        FROM Capco\AppBundle\Entity\ArgumentVote av
                        WHERE av.Voter = u)
                        AS argumentVotes')
            ->addSelect('(SELECT count(o)
                        FROM Capco\AppBundle\Entity\Opinion o
                        WHERE o.Author = u)
                        AS opinions')
            ->addSelect('(SELECT count(p)
                        FROM Capco\AppBundle\Entity\Problem p
                        WHERE p.Author = u)
                        AS problems')
            ->addSelect('(SELECT count(i)
                        FROM Capco\AppBundle\Entity\Idea i
                        WHERE i.Author = u)
                        AS ideas')
            ->addSelect('(SELECT count(a)
                        FROM Capco\AppBundle\Entity\Argument a
                        WHERE a.Author = u)
                        AS arguments')
            ->where('u.id = :userId')
            ->setParameter('userId', $user->getId());
        return $qb
            ->getQuery()
            ->getSingleResult();
    }
}
