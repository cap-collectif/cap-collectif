<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\UserInvite;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * @method UserInvite|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserInvite|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserInvite[]    findAll()
 * @method UserInvite[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserInviteRepository extends EntityRepository
{
    /**
     * @return array{UserInvite}
     */
    public function findPaginated(?int $limit, ?int $offset): array
    {
        return $this->getPaginated($limit, $offset)
            ->addOrderBy('ui.createdAt')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return array{string}
     */
    public function findAllEmails(): array
    {
        $results = $this->createQueryBuilder('ui')
            ->select('ui.email')
            ->getQuery()
            ->getArrayResult();

        return array_map(fn($row) => $row['email'], $results);
    }

    /**
     * @return UserInvite[]
     */
    public function findByEmails(array $emails): array
    {
        return $this->createQueryBuilder('ui')
            ->andWhere('ui.email IN (:emails)')
            ->addOrderBy('ui.createdAt')
            ->setParameter('emails', $emails)
            ->getQuery()
            ->getResult();
    }

    public function findOneByToken(string $token): ?UserInvite
    {
        return $this->createQueryBuilder('ui')
            ->andWhere('ui.token = :token')
            ->setParameters(['token' => $token])
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneByTokenNotExpiredAndEmail(string $token, string $email): ?UserInvite
    {
        return $this->createQueryBuilder('ui')
            ->andWhere('ui.token = :token')
            ->andWhere('ui.email = :email')
            ->andWhere('ui.expiresAt > :now')
            ->setParameters([
                'token' => $token,
                'now' => new \DateTimeImmutable(),
                'email' => $email,
            ])
            ->getQuery()
            ->getOneOrNullResult();
    }

    private function getPaginated(?int $limit, ?int $offset): QueryBuilder
    {
        return $this->createQueryBuilder('ui')
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50);
    }
}
