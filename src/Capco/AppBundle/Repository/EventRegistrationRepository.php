<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityRepository;

class EventRegistrationRepository extends EntityRepository
{
    public function getNotRegistredParticipantsInEvent(Event $event)
    {
        $qb = $this->createQueryBuilder('registration');

        return $qb
            // ->select('registration.username', 'registration.email')
            ->andWhere('registration.user IS NULL')
            ->andWhere('registration.confirmed = true')
            ->andWhere('registration.event = :event')
            ->setParameter('event', $event)
            ->getQuery()
            ->getResult();
    }
}
