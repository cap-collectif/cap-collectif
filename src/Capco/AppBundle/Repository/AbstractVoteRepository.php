<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityNotFoundException;
use Doctrine\ORM\EntityRepository;

class AbstractVoteRepository extends EntityRepository
{
    public function countNotExpired(): int
    {
        return $this->createQueryBuilder('v')
          ->select('COUNT(DISTINCT v.id)')
          ->andWhere('v.expired = false')
          ->getQuery()
          ->getSingleScalarResult()
          ;
    }

    /**
     * Gets the history of votes for a certain related item.
     *
     * @param mixed $objectType
     * @param mixed $object
     */
    public function getHistoryFor($objectType, $object)
    {
        $qb = $this->getEntityManager()->createQueryBuilder()
            ->from(sprintf('Capco\\AppBundle\\Entity\\%sVote', ucfirst($objectType)), 'v')
            ->andWhere('v.expired = false')
            ->addOrderBy('v.createdAt', 'ASC')
        ;

        if (in_array($objectType, ['opinion', 'opinionVersion'], true)) {
            $qb
                ->addOrderBy('v.updatedAt', 'ASC')
                ->addSelect('v.updatedAt', 'v.value')
                ->andWhere(sprintf('v.%s = :object', $objectType))
                ->setParameter('object', $object)
            ;
        }

        $votes = $qb->getQuery()->getScalarResult();
        $result = [];
        $counts = [
            'date' => '',
            '-1' => 0,
            '0' => 0,
            '1' => 0,
        ];

        foreach ($votes as $i => $vote) {
            if (isset($counts[$vote['value']])) {
                ++$counts[$vote['value']];
                $counts['date'] = (new \DateTime(isset($vote['updatedAt']) ? $vote['updatedAt'] : $vote['createdAt']))->getTimestamp();
                $result[] = array_values($counts);
            }
        }

        return $result;
    }

    /**
     * Get one vote by id.
     *
     * @param $vote
     * @param mixed $id
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOneById($id)
    {
        return $this->getQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'r')
            ->leftJoin('v.user', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->andWhere('v.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Get votes by user.
     *
     * @param user
     * @param mixed $user
     *
     * @return mixed
     */
    public function getPublicVotesByUser($user)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'm')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.Media', 'm')
            ->andWhere('v.user = :user')
            ->setParameter('user', $user)
            ->orderBy('v.createdAt', 'ASC');

        $votes = $qb->getQuery()->execute();
        $publicVotes = [];
        foreach ($votes as $vote) {
            try {
                if (!method_exists($vote, 'getProposal') || !$vote->getProposal()->isDeleted()) {
                    if (!method_exists($vote, 'isPrivate') || !$vote->isPrivate()) {
                        $publicVotes[] = $vote;
                    }
                }
            } catch (EntityNotFoundException $e) {
            }
        }

        return $publicVotes;
    }

    public function getByObjectUser($objectType, $object, $user)
    {
        $qb = $this->getEntityManager()->createQueryBuilder()
            ->from(sprintf('Capco\\AppBundle\\Entity\\%sVote', ucfirst($objectType)), 'v')
            ->andWhere('v.expired = false')
        ;

        if (in_array($objectType, ['opinion', 'opinionVersion'], true)) {
            $qb->addSelect('v.value')
                ->andWhere(sprintf('v.%s = :object', $objectType))
                ->andWhere('v.user = :user')
                ->setParameter('user', $user)
                ->setParameter('object', $object)
            ;
        }

        $result = $qb->getQuery()->getOneOrNullResult();

        return $result ? $result['value'] : null;
    }

    protected function getQueryBuilder()
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.expired = false')
        ;
    }
}
