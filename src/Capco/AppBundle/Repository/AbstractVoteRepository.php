<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;

/**
 * AbstractVoteRepository.
 */
class AbstractVoteRepository extends EntityRepository
{
    /**
     * Gets the history of votes for a certain related item
     */
    public function getHistoryFor($objectType, $object) {
        $qb = $this->getEntityManager()->createQueryBuilder()
            ->from(sprintf('Capco\\AppBundle\\Entity\\%sVote', ucfirst($objectType)), 'v')
            ->andWhere('v.confirmed = :confirmed')
            ->setParameter('confirmed', true)
            ->addOrderBy('v.updatedAt', 'ASC');

        if (in_array($objectType, ['opinion', 'opinionVersion'])) {
            $qb->addSelect('v.updatedAt', 'v.value')
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
                $counts[$vote['value']]++;
                $counts['date'] = (new \DateTime($vote['updatedAt']))->getTimestamp();
                $result[] = array_values($counts);
            }
        }

        return $result;
    }

    /**
     * Get one vote by id.
     *
     * @param $vote
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneById($id)
    {
        return $this->getIsConfirmedQueryBuilder()
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
     *
     * @return mixed
     */
    public function getByUser($user)
    {
        $qb = $this->getIsConfirmedQueryBuilder()
            ->addSelect('u', 'm')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.Media', 'm')
            ->andWhere('v.user = :user')
            ->setParameter('user', $user)
            ->orderBy('v.updatedAt', 'ASC');

        return $qb
            ->getQuery()
            ->execute();
    }

    protected function getIsConfirmedQueryBuilder()
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.confirmed = :confirmed')
            ->setParameter('confirmed', true);
    }
}
