<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Event\CommentChangedEvent;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CommentSubscriber implements EventSubscriberInterface
{
    const NOTIFY_TO_ADMIN = 'admin';
    const NOTIFY_TO_AUTHOR = 'author';

    private $publisher;

    public function __construct(Publisher $publisher)
    {
        $this->publisher = $publisher;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CapcoAppBundleEvents::COMMENT_CHANGED => 'onCommentChanged',
        ];
    }

    public function onCommentChanged(CommentChangedEvent $event)
    {
        $comment = $event->getComment();
        $action = $event->getAction();
        $entity = $comment->getRelatedObject();
        if ('remove' === $action) {
            $entity->decreaseCommentsCount(1);
            if ($comment instanceof ProposalComment) {
                $isAnonymous = null === $comment->getAuthor();
                $comment = [
                    'notifyTo' => self::NOTIFY_TO_ADMIN,
                    'anonymous' => $isAnonymous,
                    'notifying' => $comment->getProposal()->getProposalForm()->isNotifyingCommentOnDelete(),
                    'username' => $isAnonymous ? $comment->getAuthorName() : $comment->getAuthor()->getDisplayName(),
                    'userSlug' => $isAnonymous ? null : $comment->getAuthor()->getSlug(),
                    'body' => $comment->getBodyTextExcerpt(),
                    'proposal' => $comment->getProposal()->getTitle(),
                    'projectSlug' => $comment->getProposal()->getProject()->getSlug(),
                    'stepSlug' => $comment->getProposal()->getProposalForm()->getStep()->getSlug(),
                    'proposalSlug' => $comment->getProposal()->getSlug(),
                ];
                $this->publisher->publish('comment.delete', new Message(
                    json_encode($comment)
                ));
            }
        } elseif ('add' === $action) {
            $entity->increaseCommentsCount(1);
            $this->publisher->publish('comment.create', new Message(
                json_encode([
                    'commentId' => $comment->getId(),
                ])
            ));
        } elseif ('update' === $action) {
            $this->publisher->publish('comment.update', new Message(
                json_encode([
                    'commentId' => $comment->getId(),
                ])
            ));
        }
    }
}
