<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;

class CollectStepSerializationListener extends AbstractSerializationListener
{
    public static function getSubscribedEvents(): array
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
        // We skip if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }
        $step = $event->getObject();

        $counters = [
            'proposals' => $step->getProposalsCount(),
            'contributors' => $step->getContributorsCount(),
        ];

        $remainingTime = $step->getRemainingTime();
        if ($remainingTime) {
            if ($step->isClosed()) {
                $counters['remainingDays'] = $remainingTime['days'];
            } elseif ($step->isOpen()) {
                if ($remainingTime['days'] > 0) {
                    $counters['remainingDays'] = $remainingTime['days'];
                } else {
                    $counters['remainingHours'] = $remainingTime['hours'];
                }
            }
        }

        $event->getVisitor()->addData('counters', $counters);
    }
}
