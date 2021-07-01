<?php

namespace Capco\AppBundle\Form\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
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
        $options = $event
            ->getForm()
            ->getConfig()
            ->getOptions();

        $fields = $options['fields'];
        $fieldOptions = $options['fields_options'];

        foreach ($fields as $fieldName) {
            $options = $fieldOptions[$fieldName] ?? [];
            $event->getForm()->add($fieldName, TextType::class, $options);
        }
    }
}
