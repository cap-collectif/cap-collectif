<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Synthesis\SynthesisLogItem;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\SynthesisElementChangedEvent;

class SynthesisSubscriber implements EventSubscriberInterface
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents()
    {
        return [
            CapcoAppBundleEvents::SYNTHESIS_ELEMENT_CHANGED => 'onSynthesisElementChanged',
        ];
    }

    public function onSynthesisElementChanged(SynthesisElementChangedEvent $event)
    {
        $element = $event->getElement();
        $author = $event->getAuthor();
        $action = $event->getAction();

        $log = new SynthesisLogItem($element, $author, $action);
        $this->em->persist($log);
        $this->em->flush();
    }
}
