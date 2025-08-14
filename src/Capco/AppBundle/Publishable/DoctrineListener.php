<?php

namespace Capco\AppBundle\Publishable;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Interfaces\DraftableInterface;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\EventSubscriber;
use Doctrine\Persistence\Event\LifecycleEventArgs;

class DoctrineListener implements EventSubscriber
{
    public function __construct(private readonly Manager $manager)
    {
    }

    public function getSubscribedEvents(): array
    {
        return ['prePersist'];
    }

    public function prePersist(LifecycleEventArgs $args)
    {
        $entity = $args->getObject();

        if (!$entity instanceof Publishable) {
            return;
        }

        if ($entity->isPublished()) {
            return;
        }

        if ($entity instanceof Comment) {
            self::handleCommentPublished($entity);

            return;
        }

        self::setPublishedStatus($entity);
    }

    public static function setPublishedStatus(Publishable $entity)
    {
        /** @var User $author */
        $author = $entity->getAuthor();

        if (!self::handleContribution($entity)) {
            return;
        }

        if (!$author || $author->isEmailConfirmed()) {
            if ($entity instanceof DraftableInterface && $entity->isDraft()) {
                return;
            }
            $entity->setPublishedAt(new \DateTime());
        }
    }

    public function handleCommentPublished(Comment $comment)
    {
        $isModerationEnabled = $this->manager->isActive(Manager::moderation_comment);
        $isAnonymousComment = !$comment->getAuthor() && $comment->getAuthorEmail();
        if ($isAnonymousComment && $isModerationEnabled) {
            return;
        }
        self::setPublishedStatus($comment);
    }

    private static function handleContribution(Publishable $entity): bool
    {
        if (!$entity instanceof ContributionInterface) {
            return true;
        }

        if (ContributionCompletionStatus::MISSING_REQUIREMENTS === $entity->getCompletionStatus()) {
            return false;
        }

        if (!$entity->getStep()) {
            return true;
        }

        $requirements = $entity->getStep()->getRequirements();
        $hasEmailRequirements = 1 === $requirements->filter(fn ($requirement) => Requirement::EMAIL_VERIFIED === $requirement->getType())->count();

        $participant = $entity->getParticipant();
        if ($hasEmailRequirements && $participant && !$participant->isEmailConfirmed()) {
            return false;
        }

        return true;
    }
}
