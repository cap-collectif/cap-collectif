<?php

namespace Capco\AppBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\CommentChangedEvent;

class CommentSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            CapcoAppBundleEvents::COMMENT_CHANGED => 'onCommentChanged',
        ];
    }

    public function onCommentChanged(CommentChangedEvent $event)
    {
        $comment = $event->getComment();
        $action  = $event->getAction();
        $entity  = $comment->getRelatedObject();

        if ($action == 'remove') {
            $entity->decreaseCommentsCount(1);
        }

        if ($action == 'add') {
            $entity->increaseCommentsCount(1);
        }
    }
}
