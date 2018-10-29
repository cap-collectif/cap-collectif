<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Manager\LogManager;
use Capco\UserBundle\Entity\User;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Symfony\Component\Serializer\SerializerInterface;

class SerializationListener extends AbstractSerializationListener
{
    private $logManager;
    private $mediaExtension;
    private $serializer;

    public function __construct(
        LogManager $logManager,
        MediaExtension $mediaExtension,
        SerializerInterface $serializer
    ) {
        $this->logManager = $logManager;
        $this->mediaExtension = $mediaExtension;
        $this->serializer = $serializer;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Gedmo\Loggable\Entity\LogEntry',
                'method' => 'onPostLogSerialize',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\MediaBundle\Entity\Media',
                'method' => 'onPostMediaSerialize',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Synthesis\SynthesisElement',
                'method' => 'onPostElementSerialize',
            ],
        ];
    }

    public function onPostMediaSerialize(ObjectEvent $event)
    {
        // We skip the rest if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }

        try {
            $event
                ->getVisitor()
                ->addData(
                    'url',
                    $this->mediaExtension->path(
                        $event->getObject(),
                        $this->getImageFormat($event->getContext())
                    )
                );
        } catch (RouteNotFoundException $e) {
            // Avoid some SonataMedia problems
        }
    }

    public function onPostLogSerialize(ObjectEvent $event)
    {
        // We skip the rest if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }
        $context = $event->getContext();
        $context->attributes->get('groups')->map(function (array $groups) use ($event) {
            if (\in_array('LogDetails', $groups, true)) {
                $log = $event->getObject();
                $event
                    ->getVisitor()
                    ->addData('sentences', $this->logManager->getSentencesForLog($log));
            }
        });
    }

    public function onPostElementSerialize(ObjectEvent $event)
    {
        // We skip the rest if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }
        $context = $event->getContext();
        $context->attributes->get('groups')->map(function (array $groups) use ($event) {
            if (\in_array('LogDetails', $groups, true)) {
                $element = $event->getObject();
                $context = new SerializationContext();
                $context->setGroups(['LogDetails']);
                $serializedLogs = $this->serializer->serialize(
                    $this->logManager->getLogEntries($element),
                    'json',
                    $context
                );
                $event->getVisitor()->addData('logs', json_decode($serializedLogs));
            }
        });
    }

    private function getImageFormat(SerializationContext $context)
    {
        if ($context->getVisitingStack()->isEmpty()) {
            return 'avatar';
        }

        $parent = $context->getVisitingStack()->top();
        switch (true) {
            case $parent instanceof Post:
            case $parent instanceof Project:
            case $parent instanceof Event:
            case $parent instanceof Theme:
                return 'slider';
            case $parent instanceof User:
                return 'avatar';
            default:
                return 'avatar';
        }
    }
}
