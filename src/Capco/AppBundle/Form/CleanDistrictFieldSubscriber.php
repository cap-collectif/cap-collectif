<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class CleanDistrictFieldSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [FormEvents::PRE_SUBMIT => 'preSubmit'];
    }

    public function preSubmit(FormEvent $event)
    {
        $data = $event->getData();

        if (!$data) {
            return;
        }

        if (array_key_exists('border', $data) && null === $data['border']) {
            unset($data['border']);
        }
        if (array_key_exists('background', $data) && null === $data['background']) {
            unset($data['background']);
        }

        $event->setData($data);
    }
}
