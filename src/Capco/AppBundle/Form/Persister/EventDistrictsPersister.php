<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\District\EventDistrictPositioner;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\EventDistrictPositionerRepository;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;

class EventDistrictsPersister
{
    public function __construct(
        private readonly EventDistrictPositionerRepository $districtPositionerRepository,
        private readonly GlobalDistrictRepository $globalDistrictRepository,
        private readonly EntityManagerInterface $em
    ) {
    }

    public function persist(array $districtsIds, Event $event)
    {
        $districtsIds = array_map(
            fn ($districtGlobalId) => GlobalIdResolver::getDecodedId($districtGlobalId, true),
            $districtsIds
        );
        $districtEntities = $this->globalDistrictRepository->findByIds($districtsIds);

        $oldPositioners = $this->districtPositionerRepository->findBy([
            'event' => $event,
        ]);

        foreach ($oldPositioners as $key => $oldPositioner) {
            if (!\in_array($oldPositioner->getDistrict()->getId(), $districtsIds, true)) {
                $this->em->remove($oldPositioner);
                unset($oldPositioners[$key]);
            }
        }
        $event->setEventDistrictPositioners(new ArrayCollection($oldPositioners));
        $this->recomputePositions($oldPositioners);

        $nextPosition = $this->districtPositionerRepository->getNextAvailablePosition($event);
        foreach ($districtEntities as $district) {
            $hasPosition = array_filter(
                $oldPositioners,
                fn (EventDistrictPositioner $positioner) => $positioner->getDistrict()->getId() === $district->getId()
            );

            if ($hasPosition) {
                continue;
            }

            $positioner = new EventDistrictPositioner();
            $positioner
                ->setEvent($event)
                ->setDistrict($district)
                ->setPosition($nextPosition++)
            ;

            $this->em->persist($positioner);
        }
    }

    private function recomputePositions(array $oldPositioners): void
    {
        $firstPosition = 1;
        foreach ($oldPositioners as $key => $positioner) {
            $positioner->setPosition($firstPosition++);

            $this->em->persist($positioner);
        }
    }
}
