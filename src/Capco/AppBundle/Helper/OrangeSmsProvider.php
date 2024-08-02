<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Predis\ClientInterface;
use Psr\Log\LoggerInterface;

class OrangeSmsProvider implements SmsProviderInterface
{
    public const INVALID_NUMBER = 'INVALID_NUMBER'; // For 400 errors
    public const UNAUTHORIZED = 'UNAUTHORIZED'; // For 401 errors
    public const RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'; // For 429 errors
    public const SERVER_ERROR = 'SERVER_ERROR'; // For 500 errors
    public const UNKNOWN_ERROR = 'UNKNOWN_ERROR'; // Catch-all for any other errors
    public const NOT_VALID_CODE = 'NOT_VALID_CODE';
    public const CODE_NOT_VALID = 'CODE_NOT_VALID';
    public const CODE_EXPIRED = 'CODE_EXPIRED';

    public const NOT_FOUND = 'NOT_FOUND';
    public const REDIS_KEY_SMS_VERIFICATION = 'sms:verification:';
    private OrangeClient $orangeClient;
    private LoggerInterface $logger;
    private ClientInterface $redis;
    private int $redisExpirationTime;

    public function __construct(OrangeClient $orangeClient, LoggerInterface $logger, ClientInterface $redis, int $redisExpirationTime)
    {
        $this->orangeClient = $orangeClient;
        $this->logger = $logger;
        $this->redis = $redis;
        $this->redisExpirationTime = $redisExpirationTime;
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
                return self::INVALID_NUMBER;

            case 401:
                return self::UNAUTHORIZED;

            case 429:
                return self::RATE_LIMIT_EXCEEDED;

            case 500:
                return self::SERVER_ERROR;

            default:
                $this->logger->error("Received unexpected HTTP status code: {$statusCode}");

                return self::UNKNOWN_ERROR;  // Catch-all for any other non-successful status
        }
    }

    public function verifySms(string $phone, string $code): ?string
    {
        $requestId = $this->getFromRedis($phone);

        if (!$requestId) {
            $this->logger->error("No requestId found for phone: {$phone}");

            return self::CODE_EXPIRED;
        }

        $response = $this->orangeClient->checkVerificationCode($requestId, $code);
        $statusCode = $response['statusCode'];
        $data = $response['data'];

        switch ($statusCode) {
            case 200:
                if (($data['validOtp'] ?? null) === false) {
                    return self::CODE_NOT_VALID;
                }

                return null; // Success

            case 400:
                return $data['error_description'] ?? self::INVALID_NUMBER;

            case 401:
                return $data['error_description'] ?? self::UNAUTHORIZED;

            case 403:
                return $data['error_description'] ?? self::CODE_NOT_VALID; // OTP was incorrect

            case 404:
                return $data['error_description'] ?? self::NOT_FOUND;

            case 429:
                return $data['error_description'] ?? self::RATE_LIMIT_EXCEEDED;

            case 500:
                return $data['error_description'] ?? self::SERVER_ERROR;

            default:
                $this->logger->error("Received unexpected HTTP status code: {$statusCode}");

                return 'UNKNOWN ERROR';
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
