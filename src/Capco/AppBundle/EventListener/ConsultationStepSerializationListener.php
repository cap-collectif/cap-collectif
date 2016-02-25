<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\Serializer;

class ConsultationStepSerializationListener extends AbstractSerializationListener
{
    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\ConsultationStep',
                'method' => 'onPostConsultationStep',
            ],
        ];
    }

    public function onPostConsultationStep(ObjectEvent $event)
    {
        $step = $event->getObject();

        $counters = [
            'contributions' => $step->getContributionsCount(),
            'votes' => $step->getVotesCount(),
            'contributors' => $step->getContributorsCount(),
        ];

        if (!$step->isFuture()) {
            $counters['remainingDays'] = intval($step->getRemainingDays());
        }

        $event->getVisitor()->addData('counters', $counters);
    }
}
