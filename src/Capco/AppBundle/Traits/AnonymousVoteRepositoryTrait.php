<?php

namespace Capco\AppBundle\Traits;

trait AnonymousVoteRepositoryTrait
{
    public function getAnonymousCount(): int
    {
        $qb = $this->createQueryBuilder('v')
      ->select('count(DISTINCT v.email)')
      ->where('v.user IS NULL')
  ;

        return $qb->getQuery()
      ->getSingleScalarResult()
      ;
    }
}
