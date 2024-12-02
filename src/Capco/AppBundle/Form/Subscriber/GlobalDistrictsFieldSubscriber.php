<?php

namespace Capco\AppBundle\Form\Subscriber;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\Persister\GlobalDistrictsPersister;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

/**
 * Used to add the handling of the `districts` field in a Symfony Form and deals with
 * ProjectDistrictPositionner.
 */
class GlobalDistrictsFieldSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly GlobalDistrictsPersister $persister)
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
        /** @var Project $project */
        $project = $event->getData();
        /** @var array<string> $districtIds */
        $districtIds = $form
            ->get('districts')
            ->getNormData()
            ->map(static fn (GlobalDistrict $district) => $district->getId())
            ->toArray()
        ;
        $this->persister->persist($districtIds, $project);
    }
}
