<?php

namespace Capco\AppBundle\Processor\Sms;

use Capco\AppBundle\Notifier\SmsNotifier ;
use Capco\AppBundle\Repository\SmsCreditRepository ;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class SmsCreditInitialCreditProcessor implements ProcessorInterface
{
    private SmsCreditRepository $smsCreditRepository;
    private SmsNotifier $notifier;

    public function __construct(SmsCreditRepository $smsCreditRepository, SmsNotifier $notifier)
    {
        $this->smsCreditRepository = $smsCreditRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['smsCreditId'];
        $smsCredit = $this->smsCreditRepository->find($id);
        if (!$smsCredit) {
            throw new \RuntimeException('Unable to find sms_credit with id : ' . $id);
        }

        $this->notifier->onInitialSmsCredit($smsCredit);

        return true;
    }
}
