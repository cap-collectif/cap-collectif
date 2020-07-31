<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\UserInvite;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class UserInviteListener
{
    private Publisher $publisher;
    private LoggerInterface $logger;

    public function __construct(Publisher $publisher, LoggerInterface $logger)
    {
        $this->publisher = $publisher;
        $this->logger = $logger;
    }

    public function postPersist(UserInvite $entity, LifecycleEventArgs $args): void
    {
        try {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::USER_INVITE_INVITATION,
                new Message(
                    json_encode([
                        'id' => $entity->getId(),
                    ])
                )
            );
        } catch (\Exception $exception) {
            // Fail silently
            $this->logger->warning(__CLASS__ . ': could not publish to rabbitmq.');
        }
    }
}
