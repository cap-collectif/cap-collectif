<?php

namespace Capco\AppBundle\EventListener;

use JMS\Serializer\EventDispatcher\ObjectEvent;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;

class QuestionChoiceSerializationListener extends AbstractSerializationListener
{
    private $mediaExtension;

    public function __construct(MediaExtension $mediaExtension)
    {
        $this->mediaExtension = $mediaExtension;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\QuestionChoice',
                'method' => 'onPostQuestionChoice',
            ],
        ];
    }

    public function onPostQuestionChoice(ObjectEvent $event)
    {
        $questionChoice = $event->getObject();

        if ($questionChoice->getImage()) {
            try {
                $event->getVisitor()->addData(
                    'image', [
                        'url' => $this->mediaExtension->path($questionChoice->getImage(), 'form'),
                    ]
                );
            } catch (RouteNotFoundException $e) {
                // Avoid some SonataMedia problems
            }
        }
    }
}
