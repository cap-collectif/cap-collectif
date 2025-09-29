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
    private $messageStack = [];
    private $bodyIndexed = [];

    public function __construct(
        private readonly Publisher $publisher,
        private readonly LoggerInterface $logger
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::TERMINATE => ['onKernelTerminate', 10],
            KernelEvents::FINISH_REQUEST => ['onKernelTerminate', 10],
        ];
    }

    public function orderByPriority(\ArrayObject $arrayObject): array
    {
        $array = $arrayObject->getArrayCopy();
        usort($array, static function (array $a, array $b) {
            $aPriority = $a['priority'];
            $bPriority = $b['priority'];

            return $aPriority <=> $bPriority;
        });

        return $array;
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
            foreach ($this->messageStack as $message) {
                $this->publishMessage($message['message']);
            }
            $this->messageStack = [];
            $this->bodyIndexed = [];
        }
    }

    public function getMessageStack(): array
    {
        return $this->messageStack;
    }

    public function addToMessageStack(Message $message, $priority): void
    {
        if (!\in_array($message->getBody(), $this->bodyIndexed, true)) {
            $this->messageStack[] = compact('message', 'priority');
            $this->bodyIndexed[] = $message->getBody();
        }
    }

    public function publishMessage(Message $message): void
    {
        $this->publisher->publish(CapcoAppBundleMessagesTypes::ELASTICSEARCH_INDEXATION, $message);
    }
}
