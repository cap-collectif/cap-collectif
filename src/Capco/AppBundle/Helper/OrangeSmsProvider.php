<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Enum\SendSMSErrorCode;
use Capco\AppBundle\Enum\VerifySMSErrorCode;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Predis\ClientInterface;
use Psr\Log\LoggerInterface;

class OrangeSmsProvider implements SmsProviderInterface
{
    final public const REDIS_KEY_SMS_VERIFICATION = 'sms:verification:';

    public function __construct(
        private readonly OrangeClient $orangeClient,
        private readonly LoggerInterface $logger,
        private readonly ClientInterface $redis,
        private readonly int $redisExpirationTime,
    ) {
    }

    public function sendVerificationSms(string $phone): ?string
    {
        $response = $this->orangeClient->sendVerificationCode($phone);
        $statusCode = $response['statusCode'];
        $data = $response['data'];

        switch ($statusCode) {
            case 200:
                $this->saveToRedis($phone, $data['requestId']);

                return null;  // Success

            case 400:
                $this->logger->error('400 - Returned if one of the required parameters is not specified or does not have the proper format. ' . $phone);

                return SendSMSErrorCode::INVALID_NUMBER;

            case 401:
                $this->logger->error('401 - Returned if the token is invalid or inactive. ' . $phone);

                return SendSMSErrorCode::SERVER_ERROR;

            case 429:
                $this->logger->error('429 - Returned if the max amount of SMS/EMAIL per hour and MSISDN/Email is reached. ' . $phone);

                return SendSMSErrorCode::RETRY_LIMIT_REACHED;

            case 500:
                return SendSMSErrorCode::SERVER_ERROR;

            default:
                $this->logger->error("Received unexpected HTTP status code: {$statusCode}. {$phone}");

                return SendSMSErrorCode::SERVER_ERROR;
        }
    }

    public function verifySms(string $phone, string $code): ?string
    {
        $requestId = $this->getFromRedis($phone);

        if (!$requestId) {
            $this->logger->error("No requestId found for phone: {$phone}");

            return VerifySMSErrorCode::CODE_EXPIRED;
        }

        $response = $this->orangeClient->checkVerificationCode($requestId, $code);
        $statusCode = $response['statusCode'];
        $data = $response['data'];

        // docs available here : https://github.com/cap-collectif/platform/issues/16912 - Live Identity Verify API Integration Specification v1.0.25.pdf
        switch ($statusCode) {
            case 200:
                if (($data['validOtp'] ?? null) === false) {
                    return VerifySMSErrorCode::CODE_NOT_VALID;
                }

                return null;

            case 400:
                $this->logger->error('Orange SMS API - 400 - Returned if one of the required parameters is not specified or does not have the proper format. ' . $phone);

                return VerifySMSErrorCode::SERVER_ERROR;

            case 401:
                $this->logger->error('Orange SMS API - 401 - Returned if the token is invalid or inactive. ' . $phone);

                return VerifySMSErrorCode::CODE_EXPIRED;

            case 404:
                $this->logger->error('Orange SMS API - 404 - Returned if the requestId was not found. ' . $phone);

                return VerifySMSErrorCode::CODE_EXPIRED;

            case 429:
                $this->logger->error('Orange SMS API - 429 - Maximum validation attempts reached (3 attempts maximum). ' . $phone);

                return VerifySMSErrorCode::RETRY_LIMIT_REACHED;

            case 500:
                $this->logger->error('Orange SMS API - 500 - Orange Verify API Server Error. ' . $phone);

                return VerifySMSErrorCode::SERVER_ERROR;

            default:
                $this->logger->error("Received unexpected HTTP status code: {$statusCode}. {$phone}");

                return VerifySMSErrorCode::SERVER_ERROR;
        }
    }

    public function saveToRedis(string $phone, string $requestId): void
    {
        $redisKey = self::REDIS_KEY_SMS_VERIFICATION . hash('sha256', $phone);
        $result = $this->redis->setex($redisKey, $this->redisExpirationTime, $requestId);
        if (!$result) {
            $this->logger->error("Failed to set Redis key: {$redisKey}");
        }
    }

    public function getFromRedis(string $phone): ?string
    {
        return $this->redis->get(self::REDIS_KEY_SMS_VERIFICATION . hash('sha256', $phone));
    }
}
