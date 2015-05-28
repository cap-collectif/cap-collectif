<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Manager\LogManager;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Translation\TranslatorInterface;

class SerializationListener implements EventSubscriberInterface
{
    private $logsManager;

    public function __construct(LogManager $logManager)
    {
        $this->logsManager = $logManager;
    }

    public static function getSubscribedEvents()
    {
        return array(
            array('event' => 'serializer.post_serialize', 'class' => 'Capco\AppBundle\Entity\Synthesis\SynthesisLogItem', 'method' => 'onPostLogSerialize'),
        );
    }

    public function onPostLogSerialize(ObjectEvent $event)
    {
        $log = $event->getObject();

        $event->getVisitor()->addData(
            'sentence',
            $this->logsManager->getSentenceForLog($log)
        );
    }


}