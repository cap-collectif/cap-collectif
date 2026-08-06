<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

/**
 * @internal
 * @coversNothing
 */
class HubApiGreenClientTest extends TestCase
{
    public function testAssociateFolderBuildsTheHubPayload(): void
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->expects($this->once())->method('getStatusCode')->willReturn(201);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                'http://hub.example/api/v1/folder-links',
                [
                    'headers' => [
                        'Authorization' => 'Bearer hub-token',
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'folderNumber' => 'T0603151600',
                        'aiotCode' => '0003013833',
                        'stepId' => 'step-1',
                        'consultationUrl' => 'https://platform.example/projects/test',
                        'contactEmail' => 'contact@example.com',
                    ],
                ]
            )
            ->willReturn($response)
        ;

        $step = (new OtherStep())->setId('step-1');
        $metadata = (new HubMetadata())
            ->setAiotCode('0003013833')
            ->setFolderNumber('T0603151600')
            ->setContactEmail('contact@example.com')
        ;

        $client = new HubApiGreenClient(
            httpClient: $httpClient,
            logger: $this->createMock(LoggerInterface::class),
            hubApiGreenUrl: 'http://hub.example',
            configurationRepository: $this->createConfiguredMock(
                ExternalServiceConfigurationRepository::class,
                [
                    'findHubApiGreenToken' => (new ExternalServiceConfiguration())
                        ->setType(ExternalServiceConfiguration::HUB_API_GREEN_TOKEN)
                        ->setValue('hub-token'),
                ]
            ),
        );

        $client->associateFolder($step, $metadata, 'https://platform.example/projects/test');
    }
}
