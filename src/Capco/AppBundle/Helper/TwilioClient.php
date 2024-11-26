<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Api\V2010\AccountInstance;
use Twilio\Rest\Client;

class TwilioClient
{
    // see https://www.twilio.com/docs/api/errors
    final public const ERRORS = [
        'INVALID_PARAMETER' => 60200,
        'NOT_FOUND' => 20404,
        'LANDLINE_NUMBER_NOT_SUPPORTED' => 60205,
    ];

    private readonly Client $client;
    private readonly ExternalServiceConfigurationRepository $externalServiceConfigurationRepository;
    private readonly HttpClientInterface $httpClient;

    public function __construct(
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        string $twilioSid,
        string $twilioToken,
        HttpClientInterface $httpClient
    ) {
        $this->client = new Client($twilioSid, $twilioToken);
        $this->externalServiceConfigurationRepository = $externalServiceConfigurationRepository;
        $this->httpClient = $httpClient;
    }

    public function sendVerificationCode(string $phone): array
    {
        $serviceSid = $this->getVerifyServiceSid();

        $url = "https://verify.twilio.com/v2/Services/{$serviceSid}/Verifications";
        $response = $this->httpClient->request('POST', $url, [
            'auth_basic' => $this->getSubAccountCredentials(),
            'body' => ['To' => $phone, 'Channel' => 'sms'],
        ]);

        return [
            'statusCode' => $response->getStatusCode(),
            'data' => $response->toArray(false),
        ];
    }

    public function checkVerificationCode(string $phone, string $code): array
    {
        $serviceSid = $this->getVerifyServiceSid();
        $url = "https://verify.twilio.com/v2/Services/{$serviceSid}/VerificationCheck";
        $response = $this->httpClient->request('POST', $url, [
            'auth_basic' => $this->getSubAccountCredentials(),
            'body' => ['To' => $phone, 'Code' => $code],
        ]);

        return [
            'statusCode' => $response->getStatusCode(),
            'data' => $response->toArray(false),
        ];
    }

    public function createVerifyService(string $serviceName): array
    {
        $url = 'https://verify.twilio.com/v2/Services';
        $response = $this->httpClient->request('POST', $url, [
            'auth_basic' => $this->getSubAccountCredentials(),
            'body' => ['FriendlyName' => $serviceName],
        ]);

        return [
            'statusCode' => $response->getStatusCode(),
            'data' => $response->toArray(false),
        ];
    }

    public function updateVerifyService(string $serviceName): array
    {
        $serviceSid = $this->getVerifyServiceSid();
        $url = "https://verify.twilio.com/v2/Services/{$serviceSid}";
        $response = $this->httpClient->request('POST', $url, [
            'auth_basic' => $this->getSubAccountCredentials(),
            'body' => ['FriendlyName' => $serviceName],
        ]);

        return [
            'statusCode' => $response->getStatusCode(),
            'data' => $response->toArray(false),
        ];
    }

    /**
     * @throws TwilioException
     */
    public function createSubAccount(string $name): AccountInstance
    {
        return $this->client->api->v2010->accounts->create(['friendlyName' => $name]);
    }

    private function getVerifyServiceSid(): string
    {
        $config = $this->externalServiceConfigurationRepository->findOneBy([
            'type' => ExternalServiceConfiguration::TWILIO_VERIFY_SERVICE_SID,
        ]);

        return $config->getValue();
    }

    private function getSubAccountCredentials(): array
    {
        $sid = $this->externalServiceConfigurationRepository->findOneBy([
            'type' => ExternalServiceConfiguration::TWILIO_SUBACCOUNT_SID,
        ]);
        $token = $this->externalServiceConfigurationRepository->findOneBy([
            'type' => ExternalServiceConfiguration::TWILIO_SUBACCOUNT_AUTH_TOKEN,
        ]);

        return [$sid->getValue(), $token->getValue()];
    }
}
