<?php

namespace Capco\AppBundle\Elasticsearch;

use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class DoctrineUpdateListener implements EventSubscriber, ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getSubscribedEvents(): array
    {
        return [
            'postPersist',
            'postUpdate',
            'preRemove',
        ];
    }

    public function postPersist(LifecycleEventArgs $args)
    {
        $this->sendOrder($args->getObject());
    }

    public function postUpdate(LifecycleEventArgs $args)
    {
        $this->sendOrder($args->getObject());
    }

    public function preRemove(LifecycleEventArgs $args)
    {
        $this->sendOrder($args->getObject());
    }

    private function sendOrder($entity)
    {
        // @todo send the Indexation order to the worker.
        $message = ['class' => get_class($entity), 'id' => $entity->getId()];

        // @todo the worker can then use Indexer::index(FQN, ID)
    }
}
