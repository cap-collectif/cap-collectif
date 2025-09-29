<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OrangeClient
{
    final public const CLIENT_CREDENTIALS = 'client_credentials';
    final public const SMS_OTP = 'sms_otp';
    final public const GET_ACCESS_TOKEN_URL = 'https://li.liveidentity.com/ag-authorize/public/token';
    final public const SEND_SMS_URL = 'https://li.liveidentity.com/attributes-api/public/api/v1/otp/send';
    final public const VALIDATE_SMS_CODE_URL = 'https://li.liveidentity.com/attributes-api/public/api/v1/otp/validate';

    public function __construct(
        private readonly HttpClientInterface $client,
        private readonly LoggerInterface $logger,
        private readonly string $clientId,
        private readonly string $clientSecret,
        private readonly TranslatorInterface $translator,
        private readonly SiteParameterResolver $siteParams
    ) {
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
     * @return array<string, array<string, mixed>|int>
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
        $message = $this->translator->trans(
            'phone.verify.sms.body',
            [
                'siteName' => $this->siteParams->getValue('global.site.fullname'),
                'code' => '{code}',
            ]
        );

        return [
            'headers' => [
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'msisdn' => $phone,
                'message' => $message,
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
        return match (true) {
            $e instanceof ClientExceptionInterface => 'Client',
            $e instanceof DecodingExceptionInterface => 'Decoding',
            $e instanceof RedirectionExceptionInterface => 'Redirection',
            $e instanceof ServerExceptionInterface => 'Server',
            $e instanceof TransportExceptionInterface => 'Transport',
            default => 'Unexpected',
        };
    }
}
