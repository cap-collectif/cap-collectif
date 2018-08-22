<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Coduo\PHPMatcher\Factory\SimpleFactory;
use LogicException;
use Swarrot\SwarrotBundle\Broker\PeclFactory;
use Symfony\Component\HttpKernel\KernelInterface;
use PHPUnit\Framework\Assert;

class RabbitMQContext implements KernelAwareContext
{
    /**
     * @var KernelInterface
     */
    private $kernel;

    public function setKernel(KernelInterface $kernel)
    {
        $this->kernel = $kernel;
    }

    /**
     * @Then /^the queue associated to "([^"]*)" producer has messages below:$/
     *
     * @throws \LogicException
     */
    public function theQueueAssociatedToProducerHasMessagesBelow(
        string $producerName,
        TableNode $tableNode
    ) {
        $matcher = (new SimpleFactory())->createMatcher();
        $expectedMessages = $this->getExpectedMessages($tableNode);
        $queuedMessages = $this->getQueuedMessages($producerName);

        if (0 === \count($queuedMessages)) {
            throw new LogicException('The given queue is empty');
        }

        foreach ($expectedMessages as $expectedMessage) {
            $decoded = json_decode($expectedMessage, true);
            foreach ($queuedMessages as $queuedMessage) {
                $d = json_decode($queuedMessage, true);
                foreach ($decoded as $key => $value) {
                    if (!array_key_exists($key, $d)) {
                        throw new LogicException(
                            sprintf(
                                'Message mismatch. Unknown property : "%s" %s%s',
                                $key,
                                PHP_EOL,
                                json_encode($queuedMessages)
                            )
                        );
                    }
                    if (!$matcher->match($d[$key], $decoded[$key])) {
                        throw new LogicException(
                            sprintf(
                                'Message mismatch. Queue contains:%s%s',
                                PHP_EOL,
                                json_encode($queuedMessages)
                            )
                        );
                    }
                }
            }
        }
    }

    /**
     * @Then /^the queue associated to "([^"]*)" should be empty$/
     */
    public function theQueueAssociatedToProducerShouldBeEmpty(string $producerName)
    {
        $queuedMessages = $this->getQueuedMessages($producerName);
        Assert::assertCount(
            0,
            $queuedMessages,
            'The queue is not empty (' . \count($queuedMessages) . ' queued messages)'
        );
    }

    /**
     * @Then /^the queue associated to "([^"]*)" should not be empty$/
     */
    public function theQueueAssociatedToProducerShouldNotBeEmpty(string $producerName)
    {
        $queuedMessages = $this->getQueuedMessages($producerName);
        Assert::assertGreaterThan(0, $queuedMessages, 'The queue is empty');
    }

    /**
     * @Then /^the queue associated to "([^"]*)" should have (?P<num>\d+) messages$/
     */
    public function theQueueAssociatedToProducerShouldHave(
        string $producerName,
        int $messagesCount
    ) {
        $queuedMessages = $this->getQueuedMessages($producerName);
        Assert::assertCount(
            $messagesCount,
            $queuedMessages,
            'The queue contains ' . \count($queuedMessages) . ' messages'
        );
    }

    /**
     * @When I publish in :queueName with message below:
     *
     * @throws \AMQPChannelException
     * @throws \AMQPConnectionException
     * @throws \AMQPExchangeException
     */
    public function iPublishInQueueWithMessage(string $queueName, PyStringNode $string)
    {
        $string = preg_replace('/[\x00-\x1F\x7F]/u', '', $string->getRaw());
        $swarrot = $this->getSwarrot();
        $swarrot->getExchange('capco_direct_exchange', 'rabbitmq')->publish($string, $queueName);
    }

    private function getExpectedMessages(TableNode $tableNode): array
    {
        $expectedMessages = [];
        foreach ($tableNode->getRowsHash() as $message) {
            $expectedMessages[] = $this->replaceDynamicValues($message);
        }

        return $expectedMessages;
    }

    private function getQueuedMessages(string $producerName): array
    {
        $channel = $this->getQueue($producerName);

        $queuedMessages = [];
        do {
            $message = $channel->get();
            if (!$message instanceof \AMQPEnvelope) {
                break;
            }

            $queuedMessages[] = $this->replaceDynamicValues($message->getBody());

            if (0 === $message->getHeader('message_count')) {
                break;
            }
        } while (true);

        return $queuedMessages;
    }

    private function getQueue(string $producerName): \AMQPQueue
    {
        return $this->getSwarrot()->getQueue($producerName, 'rabbitmq');
    }

    private function getSwarrot(): PeclFactory
    {
        $container = $this->kernel->getContainer();

        return $container->get('swarrot.factory.default');
    }

    private function getQueueName(string $producerName): string
    {
        return sprintf('%s_queue', $producerName);
    }

    private function replaceDynamicValues(string $data): string
    {
        return preg_replace(
            [
                '/\b(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+(\d{2}):(\d{2})\b/',
                '#:\d{10}(,|})#',
            ],
            ['ISO8601_TIMESTAMP', ':"UNIX_TIMESTAMP"$1'],
            $data
        );
    }
}
