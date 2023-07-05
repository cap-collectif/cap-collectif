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

        self::unsetIfContainsNothing('border', $data);
        self::unsetIfContainsNothing('background', $data);

        $event->setData($data);
    }

    private static function unsetIfContainsNothing(string $key, array &$data): void
    {
        if (\array_key_exists($key, $data) && self::containsNothing($key, $data)) {
            unset($data[$key]);
        }
    }

    private static function containsNothing(string $key, array $data): bool
    {
        if (\is_array($data[$key])) {
            foreach ($data[$key] as $elt) {
                if (null !== $elt) {
                    return false;
                }
            }

            return true;
        }

        return null === $data[$key];
    }
}
