<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\Serializer;

class CollectStepSerializationListener extends AbstractSerializationListener
{
    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\CollectStep',
                'method' => 'onPostCollectStep',
            ],
        ];
    }

    public function onPostCollectStep(ObjectEvent $event)
    {
        $step = $event->getObject();

        $counters = [
            'proposals' => $step->getProposalsCount(),
            'contributors' => $step->getContributorsCount(),
        ];

        if (!$step->isFuture()) {
            $counters['remainingDays'] = intval($step->getRemainingDays());
        }

        $event->getVisitor()->addData('counters', $counters);
    }
}
