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
                'class' => 'Capco\AppBundle\Entity\Steps\AbstractStep',
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
