<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class EventRegistrationRepository extends EntityRepository
{
    public function countAllParticipantsInEvent(Event $event): int
    {
        $qb = $this->createQueryBuilder('registration');

        return $qb
            ->select('COUNT(registration.id)')
            ->andWhere('registration.confirmed = true')
            ->andWhere('registration.event = :event')
            ->setParameter('event', $event)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getParticipantsInEvent(
        Event $event,
        int $limit = 50,
        int $offset = 0
    ): Paginator {
        $qb = $this->createQueryBuilder('registration');

        $qb
            ->andWhere('registration.confirmed = true')
            ->andWhere('registration.event = :event')
            ->setParameter('event', $event)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function getAllParticipantsInEvent(Event $event)
    {
        $qb = $this->createQueryBuilder('er');

        $qb
            ->select(
                'er.email, er.username',
                'user.username as u_username',
                'user.email as u_email'
            )
            ->leftJoin('er.user', 'user')
            ->andWhere('er.event = :event')
            ->setParameter('event', $event);

        return $qb->getQuery()->getArrayResult();
    }

    public function getOneByUserAndEvent(User $user, Event $event): ?EventRegistration
    {
        $qb = $this->createQueryBuilder('registration');

        return $qb
            ->andWhere('registration.user = :user')
            ->andWhere('registration.event = :event')
            ->setParameter('event', $event)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
