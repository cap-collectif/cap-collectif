<?php

namespace Capco\AppBundle\Helper;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class OrangeClient
{
    public const CLIENT_CREDENTIALS = 'client_credentials';
    public const SMS_OTP = 'sms_otp';
    public const GET_ACCESS_TOKEN_URL = 'https://li.liveidentity.com/ag-authorize/public/token';
    public const SEND_SMS_URL = 'https://li.liveidentity.com/attributes-api/public/api/v1/otp/send';
    public const VALIDATE_SMS_CODE_URL = 'https://li.liveidentity.com/attributes-api/public/api/v1/otp/validate';
    private HttpClientInterface $client;
    private LoggerInterface $logger;

    private string $clientId;

    private string $clientSecret;

    public function __construct(HttpClientInterface $httpClient, LoggerInterface $logger, string $clientId, string $clientSecret)
    {
        $this->client = $httpClient;
        $this->logger = $logger;
        $this->clientId = $clientId;
        $this->clientSecret = $clientSecret;
    }

    /**
     * @return array<string, array<string, string>|int>
     */
    public function sendVerificationCode(string $phone): array
    {
        try {
            $accessToken = $this->requestAccessToken();
            $response = $this->client->request(
                'POST',
                self::SEND_SMS_URL,
                $this->getSendCodeRequestOptions($accessToken, $phone)
            );

            return [
                'statusCode' => $response->getStatusCode(),
                'data' => $response->toArray(false),
            ];
        } catch (\Throwable $e) {
            $errorType = $this->getErrorType($e);
            $this->logger->error(
                sprintf(
                    '%s Failed to send verification code: %s',
                    $errorType,
                    $e->getMessage()
                )
            );

            throw new \RuntimeException(
                sprintf('%s Error while sending SMS verification code', $errorType),
                0,
                $e
            );
        }
    }

    /**
     * @return array<string, array<string, string>|int>
     */
    public function checkVerificationCode(string $requestId, string $code): array
    {
        try {
            $accessToken = $this->requestAccessToken();
            $response = $this->client->request('POST', self::VALIDATE_SMS_CODE_URL, $this->getCheckCodeRequestOptions($accessToken, $requestId, $code));

            return [
                'statusCode' => $response->getStatusCode(),
                'data' => $response->toArray(false),
            ];
        } catch (\Throwable $e) {
            $errorType = $this->getErrorType($e);
            $this->logger->error(sprintf('%s error while checking SMS code: %s', $errorType, $e->getMessage()));

            throw new \RuntimeException(sprintf('%s error while checking SMS verification code', $errorType), 0, $e);
        }
    }

    /**
     * @return array<string, array<string, string>|false|string>
     */
    public function getSendCodeRequestOptions(string $accessToken, string $phone): array
    {
        return [
            'headers' => [
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'msisdn' => $phone,
                'message' => 'Your verification code is {code}',
                'type' => 'SMS',
            ]),
        ];
    }

    /**
     * @return array<string, array<string, string>|false|string>
     */
    public function getCheckCodeRequestOptions(string $accessToken, string $requestId, string $code): array
    {
        return [
            'headers' => [
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'requestId' => $requestId,
                'otpCode' => $code,
            ]),
        ];
    }

    private function requestAccessToken(): string
    {
        try {
            $response = $this->client->request(
                'POST',
                self::GET_ACCESS_TOKEN_URL,
                $this->getDefaultRequestOptions()
            );

            return $response->toArray(false)['access_token'];
        } catch (\Throwable $e) {
            $errorType = $this->getErrorType($e);
            $this->logger->error(sprintf('%s Failed to get access token: %s', $errorType, $e->getMessage()));

            throw new \RuntimeException(sprintf(
                '%s Error while getting access token from Orange API',
                $errorType
            ), 0, $e);
        }
    }

    /**
     * @return array<string, array<int|string, string>>
     */
    private function getDefaultRequestOptions(): array
    {
        return [
            'auth_basic' => [$this->clientId, $this->clientSecret],
            'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
            'body' => [
                'grant_type' => self::CLIENT_CREDENTIALS,
                'scope' => self::SMS_OTP,
            ],
        ];
    }

    private function getErrorType(\Throwable $e): string
    {
        switch (true) {
            case $e instanceof ClientExceptionInterface:
                return 'Client';

            case $e instanceof DecodingExceptionInterface:
                return 'Decoding';

            case $e instanceof RedirectionExceptionInterface:
                return 'Redirection';

            case $e instanceof ServerExceptionInterface:
                return 'Server';

            case $e instanceof TransportExceptionInterface:
                return 'Transport';

            default:
                return 'Unexpected';
        }
    }
}
