<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Enum\ModerationStatus;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class CommentListener
{
    public function __construct(private readonly Publisher $publisher, private readonly EntityManagerInterface $em, private readonly TokenStorageInterface $tokenStorage, private readonly Manager $manager)
    {
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $entity = $args->getEntity();

        if (!$entity instanceof Comment) {
            return;
        }

        $this->handlePublishedComment($entity);
        $this->handleConfirmedToken($entity);
        $this->handleModerationStatusChanges($entity);
    }

    public function postPersist(LifecycleEventArgs $args): void
    {
        $entity = $args->getEntity();

        if (!$entity instanceof Comment) {
            return;
        }

        $this->handleUnpublishedComment($entity);
        $this->handlePendingModerationNotification($entity);
    }

    private function handleUnpublishedComment(Comment $comment): void
    {
        $moderationEnabled = $this->manager->isActive(Manager::moderation_comment);
        if ($comment->isPublished() || !$moderationEnabled) {
            return;
        }
        $viewer = $this->tokenStorage->getToken()->getUser();
        if ($viewer instanceof User) {
            $this->sendAccountConfirmationParticipationEmail($viewer);
        }
    }

    private function handlePendingModerationNotification(Comment $comment): void
    {
        $moderationEnabled = $this->manager->isActive(Manager::moderation_comment);
        if (!$comment->isPending() || !$moderationEnabled || !$comment->isPublished()) {
            return;
        }
        $this->sendModerationPendingNotificationEmail($comment);
    }

    private function handleModerationStatusChanges(Comment $comment): void
    {
        $uow = $this->em->getUnitOfWork();
        $changeSet = $uow->getEntityChangeSet($comment);
        if (!isset($changeSet['moderationStatus'])) {
            return;
        }
        $oldValue = $changeSet['moderationStatus'][0];
        $newValue = $changeSet['moderationStatus'][1];

        $isApproved =
            ModerationStatus::APPROVED !== $oldValue && ModerationStatus::APPROVED === $newValue;

        $isRejected =
            ModerationStatus::REJECTED !== $oldValue && ModerationStatus::REJECTED === $newValue;

        if ($isApproved) {
            $this->sendApprovedByModerationEmail($comment);
            $this->publishComment($comment);
        }

        if ($isRejected) {
            $this->sendRejectedByModeratorEmail($comment);
            $this->setTrashedComment($comment);
        }
    }

    private function sendApprovedByModerationEmail(Comment $comment): void
    {
        $this->publisher->publish(
            'comment.moderation_approved',
            new Message(
                json_encode([
                    'commentId' => $comment->getId(),
                ])
            )
        );
    }

    private function sendRejectedByModeratorEmail(Comment $comment): void
    {
        $this->publisher->publish(
            'comment.moderation_rejected',
            new Message(
                json_encode([
                    'commentId' => $comment->getId(),
                ])
            )
        );
    }

    private function sendModerationPendingNotificationEmail(Comment $comment): void
    {
        $this->publisher->publish(
            'comment.moderation_notif_admin',
            new Message(
                json_encode([
                    'commentId' => $comment->getId(),
                ])
            )
        );
    }

    private function sendAccountConfirmationParticipationEmail(User $viewer): void
    {
        $this->publisher->publish(
            'user.confirmation_email_participation',
            new Message(
                json_encode([
                    'userId' => $viewer->getId(),
                ])
            )
        );
    }

    private function setTrashedComment(Comment $comment): void
    {
        $comment->trash();
        $this->em->flush();
    }

    private function publishComment(Comment $comment): void
    {
        $comment->publish();
        $this->em->flush();
    }

    private function handlePublishedComment(Comment $comment)
    {
        $uow = $this->em->getUnitOfWork();
        $changeSet = $uow->getEntityChangeSet($comment);

        if (!isset($changeSet['published'])) {
            return;
        }
        $newValue = $changeSet['published'][1];

        if (false === $newValue) {
            return;
        }

        $moderationEnabled = $this->manager->isActive(Manager::moderation_comment);
        if ($moderationEnabled && $comment->isPending()) {
            $this->sendModerationPendingNotificationEmail($comment);
        }
    }

    private function handleConfirmedToken(Comment $comment)
    {
        $uow = $this->em->getUnitOfWork();
        $changeSet = $uow->getEntityChangeSet($comment);

        if (!isset($changeSet['confirmationToken'])) {
            return;
        }
        $newValue = $changeSet['confirmationToken'][1];

        if (null !== $newValue) {
            return;
        }

        $moderationEnabled = $this->manager->isActive(Manager::moderation_comment);
        if ($moderationEnabled && ModerationStatus::PENDING === $comment->getModerationStatus()) {
            $this->sendModerationPendingNotificationEmail($comment);
        }
    }
}
