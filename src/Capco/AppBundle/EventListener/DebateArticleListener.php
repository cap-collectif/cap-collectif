<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DebateArticleListener
{
    private Publisher $publisher;
    private LoggerInterface $logger;

    public function __construct(Publisher $publisher, LoggerInterface $logger)
    {
        $this->publisher = $publisher;
        $this->logger = $logger;
    }

    public function postPersist(DebateArticle $entity, LifecycleEventArgs $args): void
    {
        try {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::DEBATE_ARTICLE_CRAWLER,
                new Message(
                    json_encode([
                        'id' => $entity->getId(),
                        'url' => $entity->getUrl(),
                    ])
                )
            );
        } catch (\RuntimeException $exception) {
            $this->logger->error(__CLASS__ . ': could not publish to rabbitmq.');
        }
    }

    public function preUpdate(DebateArticle $entity, PreUpdateEventArgs $event)
    {
        try {
            if ($event->hasChangedField('url')) {
                $this->publisher->publish(
                    CapcoAppBundleMessagesTypes::DEBATE_ARTICLE_CRAWLER,
                    new Message(
                        json_encode([
                            'id' => $entity->getId(),
                            'url' => $event->getNewValue('url'),
                        ])
                    )
                );
            }
        } catch (\RuntimeException $exception) {
            $this->logger->error(__CLASS__ . ': could not publish to rabbitmq.');
        }
    }
}
