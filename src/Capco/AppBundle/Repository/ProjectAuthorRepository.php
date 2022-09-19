<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectAuthor;
use Doctrine\ORM\EntityRepository;

class ProjectAuthorRepository extends EntityRepository
{
    public function findOneByUserOrOrganization(Project $project, Author $author): ?ProjectAuthor
    {
        $qb = $this->createQueryBuilder('pa');
        $qb->andWhere('pa.project = :project')
            ->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        $qb->expr()->eq('pa.user', ':author'),
                        $qb->expr()->eq('pa.organization', ':author')
                    )
            )
            ->setParameter('author', $author)
            ->setParameter('project', $project);

        return $qb->getQuery()->getOneOrNullResult();
    }
}
