<?php

namespace Capco\AppBundle\Client;

use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class HubApiGreenClient
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $hubApiGreenUrl,
        private readonly ExternalServiceConfigurationRepository $configurationRepository
    ) {
    }

    public function associateFolder(OtherStep $step, HubMetadata $metadata, string $consultationUrl): void
    {
        $hubApiGreenToken = $this->configurationRepository->findHubApiGreenToken()?->getValue() ?? '';

        if ('' === trim($hubApiGreenToken)) {
            throw new \RuntimeException('The Hub API Green token is not configured.');
        }

        $payload = [
            'folderNumber' => $metadata->getFolderNumber(),
            'aiotCode' => $metadata->getAiotCode(),
            'stepId' => $step->getId(),
            'consultationUrl' => $consultationUrl,
            'contactEmail' => $metadata->getContactEmail(),
        ];

        $response = $this->httpClient->request('POST', rtrim($this->hubApiGreenUrl, '/') . '/api/v1/folder-links', [
            'headers' => [
                'Authorization' => 'Bearer ' . $hubApiGreenToken,
                'Content-Type' => 'application/json',
            ],
            'json' => $payload,
        ]);

        $statusCode = $response->getStatusCode();
        if ($statusCode < 200 || $statusCode >= 300) {
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
