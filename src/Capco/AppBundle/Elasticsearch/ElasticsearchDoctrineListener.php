<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
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
 * - De-index any deleted object.
 *
 * All indexations are added to a RabbitMQ queue, because doing all of this synchronously
 * would be very expensive.
 */
class ElasticsearchDoctrineListener implements EventSubscriber
{
    private $publisher;

    public function __construct(Publisher $publisher)
    {
        $this->publisher = $publisher;
    }

    public function getSubscribedEvents(): array
    {
        return [Events::postPersist, Events::postUpdate, Events::preRemove];
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

    public function publishMessage(IndexableInterface $entity): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::ELASTICSEARCH_INDEXATION,
            new Message(json_encode(['class' => \get_class($entity), 'id' => $entity->getId()]))
        );
    }

    private function process($entity, bool $indexAuthor = true, bool $skipProcess = false): void
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
            $this->process($entity->getRelatedObject(), false, true);
        }
        if ($entity instanceof AbstractVote && $entity->getRelated()) {
            if ($entity->getRelated() instanceof Proposal) {
                $this->process($entity->getRelated(), false, true);
            } else {
                $this->process($entity->getRelated(), false);
            }
        }
        if ($entity instanceof Event && $entity->getProjects()->count() > 0) {
            foreach ($entity->getProjects() as $project) {
                $this->process($project, false);
            }
        }
        if (!$skipProcess && $entity instanceof Proposal) {
            if (($comments = $entity->getComments()) && $comments->count() > 0) {
                foreach ($comments as $comment) {
                    $this->process($comment, false);
                }
            }

            if (
                !empty(
                    ($votes = array_merge(
                        $entity->getSelectionVotes()->toArray(),
                        $entity->getCollectVotes()->toArray()
                    ))
                )
            ) {
                foreach ($votes as $vote) {
                    $this->process($vote, false);
                }
            }
        }
    }
}
