<?php

namespace Capco\AppBundle\Traits;

use Capco\UserBundle\Entity\User;

trait ContributionRepositoryTrait
{
    public function findCreatedSinceIntervalByAuthor(User $author, string $interval, $authorField = 'Author'): array
    {
        $now = new \DateTime();
        $from = (new \DateTime())->sub(new \DateInterval($interval));

        $qb = $this->createQueryBuilder('o');
        $qb->andWhere(
          $qb->expr()->between(
            'o.createdAt',
            ':from',
            ':to'
          )
      )
      ->andWhere('o.' . $authorField . ' = :author')
      ->setParameters([
        'from' => $from,
        'to' => $now,
        'author' => $author,
      ]);

        return $qb->getQuery()->getArrayResult();
    }

    public function getCount(): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb->select('count(DISTINCT o.id)')
          ->andWhere('o.expired = false')
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    // Only for trashable contribution
    public function countTrashed($name = 'trashed'): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb->select('count(DISTINCT o.id)')
          ->andWhere('o.expired = false')
          ->andWhere('o.' . $name . ' = true')
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }
}
