<?php
namespace Capco\AppBundle\Publishable;

use Capco\AppBundle\Model\Publishable;
use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;

class DoctrineListener implements EventSubscriber
{
    public function getSubscribedEvents(): array
    {
        return ['prePersist'];
    }

    public function prePersist(LifecycleEventArgs $args)
    {
        $entity = $args->getObject();
        if ($entity instanceof Publishable) {
            $this->setPublishedStatus($entity);
        }
    }

    public function setPublishedStatus(Publishable $entity)
    {
        $author = $entity->getAuthor();
        if (!$author || $author->isEmailConfirmed()) {
            $entity->setPublishedAt(new \DateTime());
        }
    }
}
