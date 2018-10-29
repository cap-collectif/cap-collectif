<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Resolver\OpinionTypesResolver;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class OpinionTypeSerializationListener extends AbstractSerializationListener
{
    protected $resolver;
    protected $serializer;

    public function __construct(OpinionTypesResolver $resolver, SerializerInterface $serializer)
    {
        $this->resolver = $resolver;
        $this->serializer = $serializer;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\OpinionType',
                'method' => 'onPostOpinionType',
            ],
        ];
    }

    public function onPostOpinionType(ObjectEvent $event)
    {
        // We skip the rest if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }
        if (isset($this->getIncludedGroups($event)['OpinionTypeLinks'])) {
            $opinionType = $event->getObject();
            $availableTypes = $this->resolver->getAvailableLinkTypesForConsultationStepType(
                $opinionType->getConsultationStepType()
            );

            $serializedTypes = $this->serializer->serialize(['data' => $availableTypes], 'json', [
                'OpinionTypeDetails',
            ]);

            $event
                ->getVisitor()
                ->addData('availableLinkTypes', json_decode($serializedTypes, true)['data']);
        }
    }
}
