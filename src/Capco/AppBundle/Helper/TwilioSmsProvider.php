<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Enum\UserPhoneErrors;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;

class TwilioSmsProvider implements SmsProviderInterface
{
    final public const INVALID_NUMBER = 'INVALID_NUMBER';
    final public const CODE_EXPIRED = 'CODE_EXPIRED';
    final public const CODE_NOT_VALID = 'CODE_NOT_VALID';
    final public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';

    public function __construct(private readonly TwilioClient $twilioClient)
    {
    }

    public function sendVerificationSms(string $phone): ?string
    {
        $response = $this->twilioClient->sendVerificationCode($phone);
        $statusCode = $response['statusCode'];
        $apiErrorCode = 400 === $statusCode ? $response['data']['code'] : null;

        if ($apiErrorCode === TwilioClient::ERRORS['LANDLINE_NUMBER_NOT_SUPPORTED']) {
            return UserPhoneErrors::PHONE_SHOULD_BE_MOBILE_NUMBER;
        }

        if ($apiErrorCode === TwilioClient::ERRORS['INVALID_PARAMETER']) {
            return self::INVALID_NUMBER;
        }

        if (201 === $statusCode) {
            return null;
        }

        return self::TWILIO_API_ERROR;
    }

    public function verifySms(string $phone, string $code): ?string
    {
        $response = $this->twilioClient->checkVerificationCode($phone, $code);
        $statusCode = $response['statusCode'];

        // see https://www.twilio.com/docs/verify/api/verification-check#check-a-verification
        $apiErrorCode = 404 === $statusCode ? $response['data']['code'] : null;
        if ($apiErrorCode === TwilioClient::ERRORS['NOT_FOUND']) {
            return self::CODE_EXPIRED;
        }

        if (200 === $statusCode) {
            $verificationStatus = $response['data']['status'];
            if ('pending' === $verificationStatus) {
                return self::CODE_NOT_VALID;
            }

            return null;
        }

        return self::TWILIO_API_ERROR;
    }
}
