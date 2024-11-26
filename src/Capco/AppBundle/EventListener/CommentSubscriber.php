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
    final public const NOTIFY_TO_ADMIN = 'admin';
    final public const NOTIFY_TO_AUTHOR = 'author';

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

    public function onCommentChanged(CommentChangedEvent $event): void
    {
        $comment = $event->getComment();
        $action = $event->getAction();
        $entity = $comment->getRelatedObject();
        if ('remove' === $action) {
            if ($comment instanceof ProposalComment) {
                $isAnonymous = null === $comment->getAuthor();
                $comment = [
                    'notifyTo' => self::NOTIFY_TO_ADMIN,
                    'anonymous' => $isAnonymous,
                    'notifying' => $comment
                        ->getProposal()
                        ->getProposalForm()
                        ->isNotifyingCommentOnDelete(),
                    'username' => $isAnonymous
                        ? $comment->getAuthorName()
                        : $comment->getAuthor()->getDisplayName(),
                    'userSlug' => $isAnonymous ? null : $comment->getAuthor()->getSlug(),
                    'body' => $comment->getBodyTextExcerpt(),
                    'proposal' => $comment->getProposal()->getTitle(),
                    'projectSlug' => $comment
                        ->getProposal()
                        ->getProject()
                        ->getSlug(),
                    'stepSlug' => $comment
                        ->getProposal()
                        ->getProposalForm()
                        ->getStep()
                        ->getSlug(),
                    'proposalSlug' => $comment->getProposal()->getSlug(),
                    'proposalFormNotificationEmail' => $comment
                        ->getProposal()
                        ->getProposalForm()
                        ->getNotificationsConfiguration()
                        ->getEmail(),
                ];
                $this->publisher->publish('comment.delete', new Message(json_encode($comment)));
            }
        } elseif ('add' === $action) {
            $this->publisher->publish(
                'comment.create',
                new Message(
                    json_encode([
                        'commentId' => $comment->getId(),
                    ])
                )
            );
        } elseif ('update' === $action) {
            $this->publisher->publish(
                'comment.update',
                new Message(
                    json_encode([
                        'commentId' => $comment->getId(),
                    ])
                )
            );
        } elseif ('confirm_anonymous_email' === $action) {
            $this->publisher->publish(
                'comment.confirm_anonymous_email',
                new Message(
                    json_encode([
                        'commentId' => $comment->getId(),
                    ])
                )
            );
        }
    }
}
