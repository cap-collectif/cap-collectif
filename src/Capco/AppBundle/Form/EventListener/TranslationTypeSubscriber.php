<?php

namespace Capco\AppBundle\Form\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class TranslationTypeSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [FormEvents::PRE_SET_DATA => 'preSetData'];
    }

    public function preSetData(FormEvent $event): void
    {
        foreach (
            $event
                ->getForm()
                ->getConfig()
                ->getOptions()['fields']
            as $fieldName
        ) {
            $event->getForm()->add($fieldName);
        }
    }
}
