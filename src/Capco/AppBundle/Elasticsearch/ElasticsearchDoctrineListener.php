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
use Doctrine\ORM\Events;

/**
 *  Listen any persist, update or delete operations happening in Doctrine, in order to:
 * - Index any created or updated object
 * - Re-index related author / step / project, to update counters.
 * - De-index any deleted object
 *
 * All indexations are added to a RabbitMQ queue, because doing all of this synchronously
 * would be very expensive.
 *
 **/
class ElasticsearchDoctrineListener implements EventSubscriber
{
    private $publisher;

    public function __construct(Publisher $publisher)
    {
        $this->publisher = $publisher;
    }

    public function getSubscribedEvents(): array
    {
        return [
            Events::postPersist,
            Events::postUpdate,
            Events::preRemove,
        ];
    }

    public function postPersist(LifecycleEventArgs $args): void
    {
        $this->process($args->getObject());
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $this->process($args->getObject());
    }

    public function preRemove(LifecycleEventArgs $args): void
    {
        $this->process($args->getObject());
    }

    public function handleEvent(LifecycleEventArgs $args): void
    {
        $this->process($args->getObject());
    }

    private function publishMessage(IndexableInterface $entity): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::ELASTICSEARCH_INDEXATION,
            new Message(json_encode(['class' => \get_class($entity), 'id' => $entity->getId()]))
        );
    }

    private function process($entity, bool $indexAuthor = true): void
    {
        if ($entity instanceof IndexableInterface) {
            $this->publishMessage($entity);
        }
        if (
            $indexAuthor &&
            ($entity instanceof HasAuthorInterface ||
                ($entity instanceof Contribution && method_exists($entity, 'getAuthor'))) &&
            $entity->getAuthor()
        ) {
            $this->publishMessage($entity->getAuthor());
        }
        if ($entity instanceof Comment && $entity->getRelatedObject()) {
            $this->process($entity->getRelatedObject(), false);
        }
        if ($entity instanceof AbstractVote && $entity->getRelated()) {
            $this->process($entity->getRelated(), false);
        }
    }
}
