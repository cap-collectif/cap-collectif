<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Message\DebateArticleCrawlerMessage;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\MessageBusInterface;

class DebateArticleListener
{
    public function __construct(
        private readonly MessageBusInterface $messageBus,
        private readonly LoggerInterface $logger
    ) {
    }

    public function postPersist(DebateArticle $entity, LifecycleEventArgs $args): void
    {
        try {
            $this->messageBus->dispatch(
                message: new DebateArticleCrawlerMessage(
                    debateArticleId: $entity->getId()
                )
            );
        } catch (\Throwable $exception) {
            $this->logger->error(
                message: self::class . ': could not dispatch debate article crawler message.',
                context: [
                    'debateArticleId' => $entity->getId(),
                    'exception' => $exception,
                ]
            );
        }
    }

    public function preUpdate(DebateArticle $entity, PreUpdateEventArgs $event): void
    {
        try {
            if ($event->hasChangedField(field: 'url')) {
                $this->messageBus->dispatch(
                    message: new DebateArticleCrawlerMessage(
                        debateArticleId: $entity->getId()
                    )
                );
            }
        } catch (\Throwable $exception) {
            $this->logger->error(
                message: self::class . ': could not dispatch debate article crawler message.',
                context: [
                    'debateArticleId' => $entity->getId(),
                    'exception' => $exception,
                ]
            );
        }
    }
}
