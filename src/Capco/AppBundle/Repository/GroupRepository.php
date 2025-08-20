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
            ->setParameter('title', $title)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getGroupsByUser(User $user): array
    {
        $qb = $this->createQueryBuilder('g');
        $qb->leftJoin('g.userGroups', 'ug')
            ->andWhere('ug.user = :user')
            ->addOrderBy('g.createdAt', 'ASC')
            ->setParameter('user', $user)
        ;

        return $qb->getQuery()->getResult();
    }

    public function getAllowedUserGroupForProject(
        Project $project,
        ?int $offset = null,
        ?int $limit = null
    ): Paginator {
        $qb = $this->createQueryBuilder('g');
        $qb->leftJoin('g.projectsVisibleByTheGroup', 'p')
            ->andWhere('p.id = :project')
            ->setParameter('project', $project->getId())
        ;
        $query = $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return new Paginator($query);
    }

    public function countGroupsAllowedForProject(Project $project): int
    {
        $qb = $this->createQueryBuilder('g');
        $qb->select('COUNT(g.id)')
            ->leftJoin('g.projectsVisibleByTheGroup', 'p')
            ->andWhere('p.id = :project')
            ->setParameter('project', $project->getId())
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('g')
            ->select('count(g.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function getByTerm(?int $offset = null, ?int $limit = null, ?string $term = ''): array
    {
        $qb = $this->createQueryBuilder('g')
            ->where('g.title LIKE :term')
            ->setParameters(['term' => "%{$term}%"])
        ;

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getMembers(Group $group, string $term, ?int $offset = 0, ?int $limit = 10000): array
    {
        $conn = $this->_em->getConnection();
        $sql = <<<'SQL'
                        SELECT *
                        FROM (
                            SELECT TO_BASE64(CONCAT('User:', u1.id)) AS userId, u1.email AS email, u1.username AS username, 'MEMBER' AS type
                            FROM user_group g
                            LEFT JOIN user_in_group uig ON uig.group_id = g.id
                            LEFT JOIN fos_user u1 ON u1.id = uig.user_id
                            WHERE g.id = :groupId and (u1.email like :term OR u1.username like :term)
                            UNION
                            SELECT null as id, user_invite.email, '' AS username, 'INVITATION' AS type
                            FROM user_invite_groups
                            LEFT JOIN user_invite ON user_invite.id = user_invite_groups.user_invite_id
                            WHERE user_invite_groups.group_id = :groupId AND user_invite.email LIKE :term
                        ) AS RESULTS
                        LIMIT :limit OFFSET :offset
            SQL;

        $stmt = $conn->prepare($sql);

        $stmt->bindValue('groupId', $group->getId(), \PDO::PARAM_STR);
        $stmt->bindValue('term', '%' . $term . '%', \PDO::PARAM_STR);
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, \PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAllAssociative();
    }

    public function countMembers(Group $group, string $term): int
    {
        $conn = $this->_em->getConnection();
        $sql = <<<'SQL'
                        SELECT COUNT(members.email)
                        FROM (
                             SELECT u1.email AS email
                             FROM user_group g
                             LEFT JOIN user_in_group uig ON uig.group_id = g.id
                             LEFT JOIN fos_user u1 ON u1.id = uig.user_id
                             WHERE g.id = :groupId and (u1.email like :term OR u1.username like :term)
                             UNION
                             SELECT user_invite.email
                             FROM user_invite_groups
                             LEFT JOIN user_invite ON user_invite.id = user_invite_groups.user_invite_id
                             WHERE user_invite_groups.group_id = :groupId AND user_invite.email LIKE :term
                        ) AS members
            SQL;
        $stmt = $conn->prepare($sql);
        $params = ['term' => "%{$term}%", 'groupId' => $group->getId()];
        $stmt->execute($params);

        return $stmt->fetchColumn();
    }
}
