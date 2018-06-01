<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Event;
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
}
