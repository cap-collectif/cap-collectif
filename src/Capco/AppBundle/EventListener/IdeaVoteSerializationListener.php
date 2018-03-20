<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\IdeaVote;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\PreSerializeEvent;

class IdeaVoteSerializationListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.pre_serialize',
                'class' => 'Capco\AppBundle\Entity\IdeaVote',
                'method' => 'onPreIdeaVote',
            ],
        ];
    }

    public function onPreIdeaVote(PreSerializeEvent $event)
    {
        $ideaVote = $event->getObject();

        if ($ideaVote->isPrivate()) {
            $ideaVote->setUser(null);
            $ideaVote->setEmail(null);
            $ideaVote->setUsername(IdeaVote::ANONYMOUS);
        }
    }
}
