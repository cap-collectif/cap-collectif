<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Resolver\OpinionTypesResolver;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\Serializer;
use JMS\Serializer\SerializationContext;

class OpinionTypeSerializationListener implements EventSubscriberInterface
{
    protected $resolver;
    protected $serializer;

    public function __construct(OpinionTypesResolver $resolver, Serializer $serializer)
    {
        $this->resolver = $resolver;
        $this->serializer = $serializer;
    }

    public static function getSubscribedEvents()
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
        if (isset($this->getIncludedGroups($event)['OpinionTypeLinks'])) {
            $opinionType = $event->getObject();
            $availableTypes = $this->resolver->getAvailableLinkTypesForConsultationStepType(
                $opinionType->getConsultationStepType()
            );

            $context = new SerializationContext();
            $context->setGroups(['OpinionTypeDetails']);
            $serializedTypes = $this->serializer->serialize(
                ['data' => $availableTypes],
                'json',
                $context
            );

            $event->getVisitor()->addData(
                'availableLinkTypes',
                json_decode($serializedTypes, true)['data']
            );
        }
    }

    protected function getIncludedGroups($event)
    {
        $exclusionStrategy = $event->getContext()->getExclusionStrategy();
        if (!$exclusionStrategy) {
            return [];
        }

        $reflectionClass = new \ReflectionClass('JMS\Serializer\Exclusion\GroupsExclusionStrategy');
        $reflectionProperty = $reflectionClass->getProperty('groups');
        $reflectionProperty->setAccessible(true);

        return $reflectionProperty->getValue($exclusionStrategy);
    }
}
