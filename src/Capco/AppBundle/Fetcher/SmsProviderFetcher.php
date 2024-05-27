<?php

namespace Capco\AppBundle\Fetcher;

use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Helper\OrangeSmsProvider;
use Capco\AppBundle\Helper\TwilioSmsProvider;

class SmsProviderFetcher
{
    public const PROVIDER_TWILIO = 'twilio';
    public const PROVIDER_ORANGE = 'orange';
    private TwilioSmsProvider $twilioSmsProvider;
    private OrangeSmsProvider $orangeSmsProvider;
    private string $smsProvider;

    public function __construct(
        TwilioSmsProvider $twilioSmsProvider,
        OrangeSmsProvider $orangeSmsProvider,
        string $smsProvider
    ) {
        $this->twilioSmsProvider = $twilioSmsProvider;
        $this->orangeSmsProvider = $orangeSmsProvider;
        $this->smsProvider = $smsProvider;
    }

    public function fetch(): SmsProviderInterface
    {
        switch ($this->smsProvider) {
            case self::PROVIDER_ORANGE:
                return $this->orangeSmsProvider;

            default:
                return $this->twilioSmsProvider;
        }
    }
}
