<?php

namespace Capco\AppBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AbstractCommentChangedEvent;

class CommentSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            CapcoAppBundleEvents::ABSTRACT_COMMENT_CHANGED => 'onAbstractCommentChanged',
        ];
    }

    public function onAbstractCommentChanged(AbstractCommentChangedEvent $event)
    {
        $comment = $event->getComment();
        $action = $event->getAction();
        $entity = $comment->getRelatedObject();

        if ($action == 'remove') {
            $entity->decreaseCommentsCount(1);
        }

        if ($action == 'add') {
            $entity->increaseCommentsCount(1);
        }
    }
}
