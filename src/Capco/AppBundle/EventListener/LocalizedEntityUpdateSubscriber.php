<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Model\Translation;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Events;

class LocalizedEntityUpdateSubscriber implements EventSubscriber
{
    /**
     * {@inheritdoc}
     */
    public function getSubscribedEvents()
    {
        return [Events::postUpdate];
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $entity = $args->getEntity();
        if ($entity instanceof Translation) {
            $translatable = $entity->getTranslatable();
            if (method_exists($translatable, 'setUpdatedAt')) {
                $translatable->setUpdatedAt(new \DateTime());
                $args->getEntityManager()->persist($translatable);
                $args->getEntityManager()->flush();
            }
        }
    }
}
