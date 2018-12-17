<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

/**
 * We need to clean the `border`and `background` value from datas
 * before submitting the form if there are `null`
 * in order to prevent error durring the form processing datas.
 */
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
