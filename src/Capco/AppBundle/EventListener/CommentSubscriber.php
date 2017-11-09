<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Event\CommentChangedEvent;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class CommentSubscriber implements EventSubscriberInterface
{
    const NOTIFY_TO_ADMIN = 'admin';
    const NOTIFY_TO_AUTHOR = 'author';

    /**
     * @var Publisher
     */
    private $publisher;
    /**
     * @var TokenStorageInterface
     */
    private $tokenStorage;

    public function __construct(Publisher $publisher, TokenStorageInterface $tokenStorage)
    {
        $this->publisher = $publisher;
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents()
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
            if ($comment instanceof ProposalComment && $comment->getProposal()->getProposalForm()->isNotifyingCommentOnDelete()) {
                $this->publisher->publish('comment.delete', new Message(
                    json_encode([
                        'notify_type' => self::NOTIFY_TO_ADMIN,
                        'username' => $comment->getAuthor()->getDisplayName(),
                        'userSlug' => $comment->getAuthor()->getSlug(),
                        'body' => $comment->getBody(),
                        'proposal' => $comment->getProposal()->getTitle(),
                        'projectSlug' => $comment->getProposal()->getProject()->getSlug(),
                        'stepSlug' => $comment->getProposal()->getProposalForm()->getStep()->getSlug(),
                        'proposalSlug' => $comment->getProposal()->getSlug(),
                    ])
                ));
            }
        } elseif ('add' === $action) {
            $entity->increaseCommentsCount(1);
            if ($comment instanceof ProposalComment && $comment->getProposal()->getProposalForm()->isNotifyingCommentOnCreate()) {
                $this->publisher->publish('comment.create', new Message(
                    json_encode([
                        'notify_type' => self::NOTIFY_TO_ADMIN,
                        'commentId' => $comment->getId(),
                    ])
                ));
            }
            if ($comment instanceof ProposalComment &&
                $comment->getProposal()->getAuthor()->getNotificationsConfiguration()->isOnProposalCommentMail() &&
                $comment->getProposal()->getAuthor() !== $comment->getAuthor()) {
                $this->publisher->publish('comment.create', new Message(
                    json_encode([
                        'notify_type' => self::NOTIFY_TO_AUTHOR,
                        'commentId' => $comment->getId(),
                    ])
                ));
            }
        } elseif ('update' === $action) {
            if ($comment instanceof ProposalComment && $comment->getProposal()->getProposalForm()->isNotifyingCommentOnUpdate()) {
                $this->publisher->publish('comment.update', new Message(
                    json_encode([
                        'notify_type' => self::NOTIFY_TO_ADMIN,
                        'commentId' => $comment->getId(),
                    ])
                ));
            }
        }
    }
}
