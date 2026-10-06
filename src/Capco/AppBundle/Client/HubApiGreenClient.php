<?php

namespace Capco\AppBundle\Client;

use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Steps\CollectStep;
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
        $payload = [
            'instance_name' => $this->instanceName,
            'folderNumber' => $metadata->getFolderNumber(),
            'aiotCode' => $metadata->getAiotCode(),
            'stepId' => $step->getId(),
            'consultationUrl' => $consultationUrl,
            'emailContact' => $metadata->getContactEmail(),
        ];

        $this->request('/api/v1/folder-links', $payload, 'folder association', $step->getId());
    }

    public function updateConsultationDates(CollectStep $step, HubMetadata $metadata): void
    {
        $this->request(
            '/api/v1/folder-links/' . $metadata->getFolderNumber() . '/metadata',
            [
                'consultationStartDate' => $step->getStartAt()?->format('Y-m-d'),
                'consultationEndDate' => $step->getEndAt()?->format('Y-m-d'),
            ],
            'consultation dates update',
            $step->getId(),
            'PUT'
        );
    }

    public function updateConsultationUrl(string $consultationUrl, HubMetadata $metadata): void
    {
        $this->request(
            '/api/v1/folder-links/' . $metadata->getFolderNumber() . '/metadata',
            ['consultationUrl' => $consultationUrl],
            'consultation URL update',
            $metadata->getStep()?->getId() ?? 'unknown',
            'PUT'
        );
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function request(string $path, array $payload, string $operation, string $stepId, string $method = 'POST'): void
    {
        $credentials = $this->onePasswordClient->credentials($this->instanceName);
        $response = $this->httpClient->request($method, rtrim($this->hubApiGreenUrl, '/') . $path, [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'auth_basic' => [$credentials['username'], $credentials['password']],
            'json' => $payload,
        ]);

        $statusCode = $response->getStatusCode();
        if ($statusCode < Response::HTTP_OK || $statusCode >= Response::HTTP_MULTIPLE_CHOICES) {
            $responseBody = trim($response->getContent(false));
            $this->logger->error(sprintf('Hub API Green %s failed.', $operation), [
                'statusCode' => $statusCode,
                'stepId' => $stepId,
                'response' => $responseBody,
            ]);

            throw new \RuntimeException(
                '' !== $responseBody
                    ? $responseBody
                    : sprintf('Hub API Green %s failed with status %d.', $operation, $statusCode),
                $statusCode
            );
        }
    }
}
