<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Manager\LogManager;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use JMS\Serializer\SerializerBuilder;
use Sonata\MediaBundle\Provider\ImageProvider;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;

class SerializationListener implements EventSubscriberInterface
{
    private $logManager;
    private $imageProvider;
    private $serializer;

    public function __construct(LogManager $logManager, ImageProvider $imageProvider, Serializer $serializer)
    {
        $this->logManager = $logManager;
        $this->imageProvider = $imageProvider;
        $this->serializer = $serializer;
    }

    public static function getSubscribedEvents()
    {
        return [
            ['event' => 'serializer.post_serialize', 'class' => 'Gedmo\Loggable\Entity\LogEntry', 'method' => 'onPostLogSerialize'],
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\MediaBundle\Entity\Media', 'method' => 'onPostMediaSerialize'],
            ['event' => 'serializer.post_serialize', 'class' => 'Capco\AppBundle\Entity\Synthesis\SynthesisElement', 'method' => 'onPostElementSerialize'],
        ];
    }

    public function onPostMediaSerialize(ObjectEvent $event)
    {
        $event->getVisitor()->addData(
            'url',
            $this->imageProvider->generatePublicUrl($event->getObject(), 'default_small')
        );
    }

    public function onPostLogSerialize(ObjectEvent $event)
    {
        $context = $event->getContext();
        $context->attributes->get('groups')->map(
            function (array $groups) use ($event) {
                if (in_array('LogDetails', $groups)) {
                    $log = $event->getObject();
                    $event->getVisitor()->addData(
                        'sentences',
                        $this->logManager->getSentencesForLog($log)
                    );
                }
            }
        );
    }

    public function onPostElementSerialize(ObjectEvent $event)
    {
        $context = $event->getContext();
        $context->attributes->get('groups')->map(
            function (array $groups) use ($event) {
                if (in_array('LogDetails', $groups)) {
                    $element = $event->getObject();
                    $context = new SerializationContext();
                    $context->setGroups(['LogDetails']);
                    $serializedLogs = $this->serializer->serialize(
                        $this->logManager->getLogEntries($element),
                        'json',
                        $context
                    );
                    $event->getVisitor()->addData(
                        'logs',
                        json_decode($serializedLogs)
                    );
                }
            }
        );
    }
}
