<?php

namespace Capco\AppBundle\Mailer\SendInBlue;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class SendInBluePublisher
{
    public function __construct(private readonly Publisher $publisher)
    {
    }

    /**
     * @param array<string, array<string, mixed>|string> $args
     */
    public function pushToSendinblue(string $method, array $args): void
    {
        $jsonData = json_encode(['method' => $method, 'args' => $args]);
        $body = (false !== $jsonData) ? $jsonData : null;
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::SENDINBLUE,
            new Message($body)
        );
    }
}
