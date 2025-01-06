<?php

namespace Capco\AppBundle\Behat;

use App\Kernel;
use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Coduo\PHPMatcher\PHPMatcher;
use LogicException;
use PHPUnit\Framework\Assert;
use Swarrot\Broker\Message;
use Swarrot\Broker\MessageProvider\MessageProviderInterface;
use Swarrot\Broker\MessagePublisher\MessagePublisherInterface;

class RabbitMQContext implements Context
{
    public function __construct(private readonly Kernel $kernel)
    {
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
        $matcher = new PHPMatcher();
        $expectedMessages = $this->getExpectedMessages($tableNode);
        $queuedMessages = $this->getQueuedMessages($producerName);

        if (0 === \count($queuedMessages)) {
            throw new LogicException('The given queue is empty');
        }

        foreach ($expectedMessages as $expectedMessage) {
            $decoded = json_decode((string) $expectedMessage, true);
            foreach ($queuedMessages as $queuedMessage) {
                $d = json_decode((string) $queuedMessage, true);
                foreach ($decoded as $key => $value) {
                    if (!isset($d[$key])) {
                        throw new LogicException(sprintf('Message mismatch. Unknown property : "%s" %s%s', $key, \PHP_EOL, json_encode($queuedMessages)));
                    }
                    if (!$matcher->match($d[$key], $decoded[$key])) {
                        throw new LogicException(sprintf('Message mismatch. Queue contains:%s%s', \PHP_EOL, json_encode($queuedMessages)));
                    }
                }
            }
        }
    }

    /**
     * @Then /^the queue associated to "([^"]*)" producer contains message below:$/
     *
     * @throws \LogicException
     */
    public function theQueueAssociatedToProducerContainsMessageBelow(
        string $producerName,
        TableNode $tableNode
    ) {
        $expectedMessages = $this->getExpectedMessages($tableNode);
        $queuedMessages = $this->getQueuedMessages($producerName);

        if (0 === \count($queuedMessages)) {
            throw new LogicException('The given queue is empty');
        }

        foreach ($expectedMessages as $expectedMessage) {
            $isMissing = true;

            foreach ($queuedMessages as $queuedMessage) {
                if ($expectedMessage === $queuedMessage) {
                    $isMissing = false;

                    break;
                }
            }
            if ($isMissing) {
                throw new LogicException('the given queue does not contain ' . $expectedMessage);
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
    public function theQueueAssociatedToProducerShouldHave(string $producerName, int $messagesCount)
    {
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

        $mp = $this->getSwarrotMessagePublisher();
        $mp->publish(new Message($string), $queueName);
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
        $channel = $this->getSwarrotMessageProvider($producerName);

        $queuedMessages = [];
        while (true) {
            $message = $channel->get();
            if (!$message instanceof Message) {
                break;
            }

            $queuedMessages[] = $this->replaceDynamicValues($message->getBody());
        }

        return $queuedMessages;
    }

    private function getSwarrotMessageProvider(string $name): MessageProviderInterface
    {
        $container = $this->kernel->getContainer();

        $factory = $container->get('swarrot.factory.default');

        return $factory->getMessageProvider($name, 'rabbitmq');
    }

    private function getSwarrotMessagePublisher(): MessagePublisherInterface
    {
        $container = $this->kernel->getContainer();

        $factory = $container->get('swarrot.factory.default');

        return $factory->getMessagePublisher('capco_direct_exchange', 'rabbitmq');
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
