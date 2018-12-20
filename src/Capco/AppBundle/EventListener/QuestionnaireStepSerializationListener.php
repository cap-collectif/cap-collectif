<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;

class QuestionnaireStepSerializationListener extends AbstractSerializationListener
{
    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\QuestionnaireStep',
                'method' => 'onPostQuestionnaireStep',
            ],
        ];
    }

    public function onPostQuestionnaireStep(ObjectEvent $event)
    {
        $step = $event->getObject();

        $counters = [
            'replies' => $step->getRepliesCount(),
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
