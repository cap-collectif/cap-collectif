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

        $event->getVisitor()->addData(
            'counters', [
                'contributions' => $step->getContributionsCount(),
                'votes' => $step->getVotesCount(),
                'contributors' => $step->getContributorsCount(),
                'remainingDays' => intval($step->getRemainingDays()),
            ]
        );
    }
}
