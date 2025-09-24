<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Service\MediaManager;
use Capco\UserBundle\Entity\User;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;

class MediaSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly MediaManager $mediaManager
    ) {
    }

    public function getSubscribedEvents(): array
    {
        return [
            Events::preUpdate,
        ];
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getEntity();

        if (!$entity instanceof User) {
            return;
        }

        $changeSet = $args->getEntityChangeSet();
        $mediaChanges = $changeSet['media'] ?? null;

        if (!$mediaChanges) {
            return;
        }

        [$oldValue, $newValue] = $mediaChanges;

        if ($oldValue instanceof Media && null === $newValue) {
            $this->mediaManager->removeWithFileIfFileExists($oldValue);
        }
    }
}
