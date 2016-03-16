<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use Capco\AppBundle\Resolver\StepResolver;

class AbstractStepSerializationListener extends AbstractSerializationListener
{
    private $stepResolver;

    public function __construct(StepResolver $stepResolver)
    {
        $this->stepResolver = $stepResolver;
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

        $event->getVisitor()->addData('openingStatus', $this->stepResolver->getOpeningStatus($step));
    }
}
