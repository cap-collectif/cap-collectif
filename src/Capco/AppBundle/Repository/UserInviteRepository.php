<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Enum\UserInviteStatus;
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
    public function findPaginated(?int $limit, ?int $offset, ?string $term, ?string $status): array
    {
        $qb = $this->getPaginated($limit, $offset);
        $qb->leftJoin('ui.groups', 'uig');
        if (null !== $term) {
            $qb->where(
                $qb
                    ->expr()
                    ->orX(
                        $qb->expr()->like('ui.email', $qb->expr()->literal('%' . $term . '%')),
                        $qb->expr()->like('uig.title', $qb->expr()->literal('%' . $term . '%'))
                    )
            );
        }
        if (UserInviteStatus::EXPIRED === $status) {
            $qb->andWhere(
                $qb
                    ->expr()
                    ->lt(
                        'ui.expiresAt',
                        $qb->expr()->literal((new \DateTimeImmutable())->format('Y/m/d H:i:s'))
                    )
            );
        }

        if (UserInviteStatus::FAILED === $status) {
            $qb->andWhere($qb->expr()->eq('ui.internalStatus', ':failed'))->setParameter(
                ':failed',
                UserInvite::SEND_FAILURE
            );
        }

        if (UserInviteStatus::PENDING === $status) {
            $qb->andWhere(
                $qb
                    ->expr()
                    ->andX(
                        $qb
                            ->expr()
                            ->orX(
                                $qb->expr()->eq('ui.internalStatus', ':pending'),
                                $qb->expr()->eq('ui.internalStatus', ':sent')
                            ),
                        $qb
                            ->expr()
                            ->gt(
                                'ui.expiresAt',
                                $qb
                                    ->expr()
                                    ->literal((new \DateTimeImmutable())->format('Y/m/d H:i:s'))
                            )
                    )
            )
                ->setParameter(':pending', UserInvite::WAITING_SENDING)
                ->setParameter(':sent', UserInvite::SENT);
        }

        if (UserInviteStatus::ACCEPTED === $status) {
            $qb->innerJoin('CapcoUserBundle:User', 'u', 'WITH', 'u.email = ui.email');
        }
        $qb->addOrderBy('ui.createdAt', 'DESC');

        return $qb->getQuery()->getResult();
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

    public function findOneByEmailAndNotExpired(string $email): ?UserInvite
    {
        return $this->createQueryBuilder('ui')
            ->andWhere('ui.email = :email')
            ->andWhere('ui.expiresAt > :now')
            ->setParameters([
                'now' => new \DateTimeImmutable(),
                'email' => $email,
            ])
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

    public function getPendingInvitations(?int $limit, ?int $offset, Group $group): array
    {
        return $this->getPaginated($limit, $offset)
            ->innerJoin('ui.groups', 'g')
            ->where('g = :group')
            ->setParameter('group', $group)
            ->getQuery()
            ->getResult();
    }

    public function findOneByStatusSentOrNotExpired(string $email): ?UserInvite
    {
        $qb = $this->createQueryBuilder('ui');
        $qb->andWhere($qb->expr()->eq('ui.email', ':email'))
            ->andWhere(
                $qb
                    ->expr()
                    ->andX(
                        $qb
                            ->expr()
                            ->orX(
                                $qb->expr()->eq('ui.internalStatus', ':sent'),
                                $qb->expr()->eq('ui.internalStatus', ':pending')
                            ),
                        $qb->expr()->gte('ui.expiresAt', ':now')
                    )
            )
            ->setParameters([
                ':email' => $email,
                ':sent' => UserInvite::SENT,
                ':pending' => UserInvite::WAITING_SENDING,
                ':now' => new \DateTimeImmutable(),
            ]);

        return $qb->getQuery()->getOneOrNullResult();
    }

    private function getPaginated(?int $limit, ?int $offset): QueryBuilder
    {
        return $this->createQueryBuilder('ui')
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50);
    }
}
