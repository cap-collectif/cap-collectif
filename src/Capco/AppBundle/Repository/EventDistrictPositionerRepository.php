<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityRepository;

class EventDistrictPositionerRepository extends EntityRepository
{
    public function findByDistrict(GlobalDistrict $district, ?int $offset = null, ?int $limit = null)
    {
        $qb = $this->createQueryBuilder('e')
            ->where('e.district = :district')
            ->setParameter('district', $district)
        ;

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    public function getNextAvailablePosition(Event $event): int
    {
        $lastPositioner = $this->createQueryBuilder('eventDistrictPositioner')
            ->leftJoin('eventDistrictPositioner.event', 'event')
            ->where('event.id = :event')
            ->orderBy('eventDistrictPositioner.position', 'DESC')
            ->setParameter('event', $event->getId())
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult()
        ;

        return $lastPositioner ? $lastPositioner->getPosition() + 1 : 1;
    }
}
