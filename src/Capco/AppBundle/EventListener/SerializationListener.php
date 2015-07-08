<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Manager\LogManager;
use Sonata\MediaBundle\Provider\ImageProvider;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;


class SerializationListener implements EventSubscriberInterface
{
    private $logManager;
    private $imageProvider;

    public function __construct(LogManager $logManager, ImageProvider $imageProvider)
    {
        $this->logManager = $logManager;
        $this->imageProvider = $imageProvider;
    }

    public static function getSubscribedEvents()
    {
        return [
            ['event' => 'serializer.post_serialize', 'class' => 'Gedmo\Loggable\Entity\LogEntry', 'method' => 'onPostLogSerialize'],
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\MediaBundle\Entity\Media', 'method' => 'onPostMediaSerialize'],
        ];
    }

    public function onPostMediaSerialize(ObjectEvent $event)
    {
        $event->getVisitor()->addData(
            'url',
            $this->imageProvider->generatePublicUrl($event->getObject(), 'reference')
        );
    }

    public function onPostLogSerialize(ObjectEvent $event)
    {
        $log = $event->getObject();

        $event->getVisitor()->addData(
            'sentences',
            $this->logManager->getSentencesForLog($log)
        );
    }
}
