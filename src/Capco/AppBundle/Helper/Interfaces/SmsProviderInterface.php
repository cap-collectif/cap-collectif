<?php

namespace Capco\AppBundle\Helper\Interfaces;

interface SmsProviderInterface
{
    public function sendVerificationSms(string $phone): ?string;

    public function verifySms(string $phone, string $code): ?string;
}
