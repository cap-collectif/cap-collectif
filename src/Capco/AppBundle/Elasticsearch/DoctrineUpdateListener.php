<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\HasAuthorInterface;
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
            $this->publisher->publish(CapcoAppBundleMessagesTypes::ELASTICSEARCH_INDEXATION, new Message(
              json_encode(['class' => \get_class($entity), 'id' => $entity->getId()])
          ));
        }
        if (($entity instanceof HasAuthorInterface || ($entity instanceof Contribution && method_exists($entity, 'getAuthor'))) && $entity->getAuthor()) {
            $this->publisher->publish(CapcoAppBundleMessagesTypes::ELASTICSEARCH_INDEXATION, new Message(
              json_encode(['class' => \get_class($entity->getAuthor()), 'id' => $entity->getAuthor()->getId()])
          ));
        }
        if ($entity instanceof Comment && $entity->getRelatedObject()) {
            $this->sendOrder($entity->getRelatedObject());
        }
        if ($entity instanceof AbstractVote && $entity->getRelated()) {
            $this->sendOrder($entity->getRelated());
        }
    }
}
