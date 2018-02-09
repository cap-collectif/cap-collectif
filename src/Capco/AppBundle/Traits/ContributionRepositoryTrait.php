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
}
