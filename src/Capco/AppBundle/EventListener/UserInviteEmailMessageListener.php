<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class UserInviteEmailMessageListener
{
    public function __construct(private readonly Publisher $publisher, private readonly LoggerInterface $logger)
    {
    }

    public function postPersist(UserInviteEmailMessage $entity, LifecycleEventArgs $args): void
    {
        try {
            $this->publisher->publish(
                $entity->getMessageType(),
                new Message(
                    json_encode([
                        'id' => $entity->getId(),
                    ])
                )
            );
        } catch (\RuntimeException) {
            $this->logger->error(__CLASS__ . ': could not publish to rabbitmq.');
        }
    }
}
