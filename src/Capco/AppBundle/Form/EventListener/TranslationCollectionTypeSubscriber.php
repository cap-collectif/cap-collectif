<?php

namespace Capco\AppBundle\Form\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormInterface;

class TranslationCollectionTypeSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [FormEvents::PRE_SET_DATA => 'preSetData'];
    }

    public function preSetData(FormEvent $event): void
    {
        $formOptions = $event
            ->getForm()
            ->getConfig()
            ->getOptions()
        ;

        foreach ($formOptions['locales'] as $locale) {
            $event->getForm()->add($locale, TranslationType::class, [
                'data_class' => $this->getTranslationClass($event->getForm()->getParent()),
                'required' => \in_array($locale, $formOptions['required_locales'], true),
                'block_name' => 'locale',
                'fields' => $formOptions['fields'],
                'fields_options' => $formOptions['fields_options'],
                'excluded_fields' => $formOptions['excluded_fields'],
            ]);
        }
    }

    private function getTranslationClass(FormInterface $form): string
    {
        return $form
            ->getConfig()
            ->getDataClass()::getTranslationEntityClass()
        ;
    }
}
