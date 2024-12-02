<?php

namespace Capco\AppBundle\Processor\Sms;

use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class SmsCreditRefillCreditProcessor implements ProcessorInterface
{
    public function __construct(private readonly SmsCreditRepository $smsCreditRepository, private readonly SmsNotifier $notifier)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['smsCreditId'];
        $smsCredit = $this->smsCreditRepository->find($id);
        if (!$smsCredit) {
            throw new \RuntimeException('Unable to find sms_credit with id : ' . $id);
        }

        $this->notifier->onRefillSmsCredit($smsCredit);

        return true;
    }
}
