<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;

class OrangeSmsProvider implements SmsProviderInterface
{
    public function sendVerificationSms(string $phone): ?string
    {
        return "Sending verification code to {$phone} using Orange SMS provider.";
        // TODO: Implement sendVerificationSms() method.
    }

    public function verifySms(string $phone, string $code): ?string
    {
        return "Verifying code {$code} for {$phone} using Orange SMS provider.";
        // TODO: Implement verifySms() method.
    }
}
