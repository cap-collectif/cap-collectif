<?php

namespace Capco\AppBundle\Form\Subscriber;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Form\Persister\EventDistrictsPersister;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

/**
 * Used to add the handling of the `districts` field in a Symfony Form and deals with
 * EventDistrictPositionner.
 */
class EventDistrictsFieldSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly EventDistrictsPersister $persister)
    {
    }

    /**
     * {@inheritdoc}
     */
    public static function getSubscribedEvents(): array
    {
        return [FormEvents::SUBMIT => 'onSubmit'];
    }

    public function onSubmit(FormEvent $event)
    {
        $form = $event->getForm();
        /** @var Event $event */
        $event = $event->getData();

        $districts = $form
            ->get('districts')
            ->getNormData()
        ;

        if (!$districts) {
            return;
        }

        $districtIds = $districts
            ->map(static fn (GlobalDistrict $district) => $district->getId())
            ->toArray()
        ;
        $this->persister->persist($districtIds, $event);
    }
}
