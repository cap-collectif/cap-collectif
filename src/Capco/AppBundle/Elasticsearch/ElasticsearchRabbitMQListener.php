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
            KernelEvents::TERMINATE => ['onKernelTerminate', 10],
            KernelEvents::FINISH_REQUEST => ['onKernelTerminate', 10]
        ];
    }

    public function orderByPriority(\ArrayObject $arrayObject): array
    {
        $arrayObject->uasort(static function (Message $a, Message $b) {
            $aPriority = json_decode($a->getBody(), true)['priority'];
            $bPriority = json_decode($b->getBody(), true)['priority'];
            if ($aPriority === $bPriority) {
                return 0;
            }

            return $aPriority < $bPriority ? -1 : 1;
        });

        return $arrayObject->getArrayCopy();
    }

    public function onKernelTerminate(): void
    {
        if (!empty($this->messageStack)) {
            $this->logger->info(
                '[elastic_search_rabbitmq_listener] Publishing ' .
                    \count($this->messageStack) .
                    ' messages to the stack.'
            );
            $arrayObject = new \ArrayObject($this->messageStack);
            $this->messageStack = $this->orderByPriority($arrayObject);
            // deduplicate messageStack
            $bodyIndexed = [];
            /** @var Message $message */
            foreach ($this->messageStack as $message) {
                if (!\in_array($message->getBody(), $bodyIndexed, true)) {
                    $this->publishMessage($message);
                }
                $bodyIndexed[] = $message->getBody();
            }
            $this->messageStack = [];
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
