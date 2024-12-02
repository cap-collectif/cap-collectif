<?php

namespace Capco\AppBundle\Fetcher;

use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\AppBundle\Helper\OrangeSmsProvider;
use Capco\AppBundle\Helper\TwilioSmsProvider;

class SmsProviderFetcher
{
    final public const PROVIDER_TWILIO = 'twilio';
    final public const PROVIDER_ORANGE = 'orange';

    public function __construct(private readonly TwilioSmsProvider $twilioSmsProvider, private readonly OrangeSmsProvider $orangeSmsProvider, private readonly string $smsProvider)
    {
    }

    public function fetch(): SmsProviderInterface
    {
        return match ($this->smsProvider) {
            self::PROVIDER_ORANGE => $this->orangeSmsProvider,
            default => $this->twilioSmsProvider,
        };
    }
}
