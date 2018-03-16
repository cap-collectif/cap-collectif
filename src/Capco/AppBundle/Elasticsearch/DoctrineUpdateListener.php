<?php

namespace Capco\AppBundle\Elasticsearch;

use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DoctrineUpdateListener implements EventSubscriber
{
    private $publisher;

    public function __construct(Publisher $publisher)
    {
        $this->publisher = $publisher;
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
        if ($entity instanceof IndexableInterface) {
            $this->publisher->publish('elasticsearch.indexation', new Message(
              json_encode(['class' => get_class($entity), 'id' => $entity->getId()])
          ));
        }
    }
}
