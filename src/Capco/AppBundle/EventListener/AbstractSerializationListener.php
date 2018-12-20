<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\EventSubscriberInterface;

abstract class AbstractSerializationListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
        ];
    }

    protected function getIncludedGroups($event)
    {
        $exclusionStrategy = $event->getContext()->getExclusionStrategy();
        if (!$exclusionStrategy) {
            return [];
        }

        // TODO remove this condition when we rewrite synthesis app
        if ('JMS\Serializer\Exclusion\DisjunctExclusionStrategy' === \get_class($exclusionStrategy)) {
            return [];
        }

        $reflectionClass = new \ReflectionClass('JMS\Serializer\Exclusion\GroupsExclusionStrategy');
        $reflectionProperty = $reflectionClass->getProperty('groups');
        $reflectionProperty->setAccessible(true);

        return $reflectionProperty->getValue($exclusionStrategy);
    }

    protected function eventHasGroup($event, $group)
    {
        return isset($this->getIncludedGroups($event)[$group]);
    }
}
