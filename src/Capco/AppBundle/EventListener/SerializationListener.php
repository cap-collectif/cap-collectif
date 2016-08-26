<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Manager\LogManager;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Capco\AppBundle\Entity\Post;
use Capco\UserBundle\Entity\User;

class SerializationListener extends AbstractSerializationListener
{
    private $logManager;
    private $mediaExtension;
    private $serializer;

    public function __construct(LogManager $logManager, MediaExtension $mediaExtension, Serializer $serializer)
    {
        $this->logManager = $logManager;
        $this->mediaExtension = $mediaExtension;
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

    private function getImageFormat(SerializationContext $context)
    {
      $parent = $context->getVisitingStack()->top();
      switch (true) {
        case $parent instanceof Post:
          return 'post';
        case $parent instanceof User:
          return 'avatar';
        default:
          return 'avatar';
      }
    }

    public function onPostMediaSerialize(ObjectEvent $event)
    {
        try {
            $event->getVisitor()->addData(
                'url',
                $this->mediaExtension->path($event->getObject(), $this->getImageFormat($event->getContext()))
            );
        } catch (RouteNotFoundException $e) {
            // Avoid some SonataMedia problems
        }
    }

    public function onPostLogSerialize(ObjectEvent $event)
    {
        if ($this->eventHasGroup($event, 'LogDetails')) {
          $event->getVisitor()->addData(
              'sentences',
              $this->logManager->getSentencesForLog($event->getObject())
          );
        }
    }

    public function onPostElementSerialize(ObjectEvent $event)
    {
        if ($this->eventHasGroup($event, 'LogDetails')) {
            $serializedLogs = $this->serializer->serialize(
                $this->logManager->getLogEntries($event->getObject()),
                'json',
                (new SerializationContext())->setGroups(['LogDetails'])
            );
            $event->getVisitor()->addData(
                'logs',
                json_decode($serializedLogs)
            );
        }
    }
}
