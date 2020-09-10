<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class GroupRepository extends EntityRepository
{
    public function getOneByTitle(string $title): ?Group
    {
        $qb = $this->createQueryBuilder('g')
            ->andWhere('g.title = :title')
            ->setParameter('title', $title);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getGroupsByUser(User $user): array
    {
        $qb = $this->createQueryBuilder('g');
        $qb
            ->leftJoin('g.userGroups', 'ug')
            ->andWhere('ug.user = :user')
            ->addOrderBy('g.createdAt', 'ASC')
            ->setParameter('user', $user);

        return $qb->getQuery()->getResult();
    }

    public function getAllowedUserGroupForProject(
        Project $project,
        ?int $offset = null,
        ?int $limit = null
    ): Paginator {
        $qb = $this->createQueryBuilder('g');
        $qb
            ->leftJoin('g.projectsVisibleByTheGroup', 'p')
            ->andWhere('p.id = :project')
            ->setParameter('project', $project->getId());
        $query = $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($query);
    }

    public function countGroupsAllowedForProject(Project $project): int
    {
        $qb = $this->createQueryBuilder('g');
        $qb
            ->select('COUNT(g.id)')
            ->leftJoin('g.projectsVisibleByTheGroup', 'p')
            ->andWhere('p.id = :project')
            ->setParameter('project', $project->getId());

        return $qb->getQuery()->getSingleScalarResult();
    }
}
