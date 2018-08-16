<?php
namespace Capco\AppBundle\Traits;

use Capco\UserBundle\Entity\User;

trait ContributionRepositoryTrait
{
    public function findCreatedSinceIntervalByAuthor(
        User $author,
        string $interval,
        $authorField = 'Author'
    ): array {
        $now = new \DateTime();
        $from = (new \DateTime())->sub(new \DateInterval($interval));

        $qb = $this->createQueryBuilder('o');
        $qb
            ->andWhere($qb->expr()->between('o.createdAt', ':from', ':to'))
            ->andWhere('o.' . $authorField . ' = :author')
            ->setParameters(['from' => $from, 'to' => $now, 'author' => $author]);

        return $qb->getQuery()->getArrayResult();
    }

    public function countPublished(): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb->select('count(DISTINCT o.id)')->andWhere('o.published = true');
        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countUnpublished(): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb->select('count(DISTINCT o.id)')->andWhere('o.published = false');
        return $qb->getQuery()->getSingleScalarResult();
    }

    // Only for trashable contribution
    public function countTrashed(): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb->select('count(DISTINCT o.id)')->andWhere('o.trashedAt IS NOT NULL');
        return $qb->getQuery()->getSingleScalarResult();
    }
}
