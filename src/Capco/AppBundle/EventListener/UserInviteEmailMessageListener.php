<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class UserInviteEmailMessageListener
{
    private Publisher $publisher;
    private LoggerInterface $logger;

    public function __construct(Publisher $publisher, LoggerInterface $logger)
    {
        $this->publisher = $publisher;
        $this->logger = $logger;
    }

    public function postPersist(UserInviteEmailMessage $entity, LifecycleEventArgs $args): void
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
        } catch (\RuntimeException $exception) {
            $this->logger->error(__CLASS__ . ': could not publish to rabbitmq.');
        }
    }
}
