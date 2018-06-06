<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class EventRegistrationRepository extends EntityRepository
{
    public function getNotRegisteredParticipantsInEvent(Event $event): array
    {
        $qb = $this->createQueryBuilder('registration');

        return $qb
            ->andWhere('registration.user IS NULL')
            ->andWhere('registration.confirmed = true')
            ->andWhere('registration.event = :event')
            ->setParameter('event', $event)
            ->getQuery()
            ->getResult();
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
