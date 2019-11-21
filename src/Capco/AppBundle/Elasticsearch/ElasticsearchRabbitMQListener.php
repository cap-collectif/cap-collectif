<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;

class ElasticsearchRabbitMQListener implements EventSubscriberInterface
{
    private $messageStack;
    private $publisher;
    private $logger;

    public function __construct(Publisher $publisher, LoggerInterface $logger)
    {
        $this->publisher = $publisher;
        $this->logger = $logger;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::TERMINATE => ['onKernelTerminate', 10]
        ];
    }

    public function onKernelTerminate(): void
    {
        if (!empty($this->messageStack)) {
            $this->logger->info(
                '[elastic_search_rabbitmq_listener] Publishing ' .
                    \count($this->messageStack) .
                    ' messages to the stack.'
            );
            foreach ($this->messageStack as $message) {
                $this->publishMessage($message);
            }
        }
    }

    public function addToMessageStack(Message $message): void
    {
        $this->messageStack[] = $message;
    }

    public function publishMessage(Message $message): void
    {
        $this->publisher->publish(CapcoAppBundleMessagesTypes::ELASTICSEARCH_INDEXATION, $message);
    }
}
