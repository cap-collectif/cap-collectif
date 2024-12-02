<?php

namespace Capco\AppBundle\Processor\Sms;

use Capco\AppBundle\Notifier\SmsNotifier;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class SmsCreditAlertConsumedCreditProcessor implements ProcessorInterface
{
    public function __construct(private readonly SmsNotifier $notifier)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $remainingCreditsAmount = $json['remainingCreditsAmount'];
        $percent = $json['percent'];

        if (!$remainingCreditsAmount || !$percent) {
            throw new \RuntimeException("no remainingCreditsAmount {$remainingCreditsAmount} or percent {$percent} given");
        }

        $this->notifier->onAlertSmsConsumedCredit($remainingCreditsAmount, $percent);

        return true;
    }
}
