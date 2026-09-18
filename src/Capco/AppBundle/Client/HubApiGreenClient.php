<?php

namespace Capco\AppBundle\Client;

use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class HubApiGreenClient
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $hubApiGreenUrl,
        private readonly OnePasswordClient $onePasswordClient,
        private readonly string $instanceName
    ) {
    }

    public function associateFolder(OtherStep $step, HubMetadata $metadata, string $consultationUrl): void
    {
        $credentials = $this->onePasswordClient->credentials($this->instanceName);

        $payload = [
            'instance_name' => $this->instanceName,
            'folderNumber' => $metadata->getFolderNumber(),
            'aiotCode' => $metadata->getAiotCode(),
            'stepId' => $step->getId(),
            'consultationUrl' => $consultationUrl,
            'contactEmail' => $metadata->getContactEmail(),
        ];

        $response = $this->httpClient->request('POST', rtrim($this->hubApiGreenUrl, '/') . '/api/v1/folder-links', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'auth_basic' => [$credentials['username'], $credentials['password']],
            'json' => $payload,
        ]);

        $statusCode = $response->getStatusCode();
        if ($statusCode < Response::HTTP_OK || $statusCode >= Response::HTTP_MULTIPLE_CHOICES) {
            $body = $response->getContent(false);
            $this->logger->error('Hub API Green folder association failed.', [
                'statusCode' => $statusCode,
                'stepId' => $step->getId(),
                'response' => $body,
            ]);

            throw new \RuntimeException(sprintf('Hub API Green folder association failed with status %d.', $statusCode));
        }
    }
}
