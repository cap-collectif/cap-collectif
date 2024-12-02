<?php

namespace Capco\AppBundle\Processor\Sms;

use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Repository\SmsOrderRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class SmsCreditInitialOrderProcessor implements ProcessorInterface
{
    public function __construct(private readonly SmsOrderRepository $smsOrderRepository, private readonly SmsNotifier $notifier)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['smsOrderId'];
        $smsOrder = $this->smsOrderRepository->find($id);
        if (!$smsOrder) {
            throw new \RuntimeException('Unable to find sms_order with id : ' . $id);
        }

        $this->notifier->onCreateSmsOrder($smsOrder);

        return true;
    }
}
