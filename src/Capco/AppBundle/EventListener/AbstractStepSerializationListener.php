<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use Capco\AppBundle\Helper\StepHelper;

class AbstractStepSerializationListener extends AbstractSerializationListener
{
    private $stepHelper;

    public function __construct(StepHelper $stepHelper)
    {
        $this->stepHelper = $stepHelper;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\ConsultationStep',
                'method' => 'onPostAbstractStep',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\PresentationStep',
                'method' => 'onPostAbstractStep',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\CollectStep',
                'method' => 'onPostAbstractStep',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\SelectionStep',
                'method' => 'onPostAbstractStep',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\OtherStep',
                'method' => 'onPostAbstractStep',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\RankingStep',
                'method' => 'onPostAbstractStep',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\SynthesisStep',
                'method' => 'onPostAbstractStep',
            ],
        ];
    }

    public function onPostAbstractStep(ObjectEvent $event)
    {
        $step = $event->getObject();
        $event->getVisitor()->addData('status', $this->stepHelper->getStatus($step));
    }
}
