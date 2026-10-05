<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Client\OnePasswordClient;
use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

/**
 * @internal
 * @coversNothing
 * @phpunit-status non-compliant
 * @phpunit-reason Requires a specific getStatusCode call count instead of limiting assertions to the outgoing
 * Hub request contract.
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
                        'Content-Type' => 'application/json',
                    ],
                    'auth_basic' => ['platform-instance', 'password'],
                    'json' => [
                        'instance_name' => 'platform-instance',
                        'folderNumber' => 'T0603151600',
                        'aiotCode' => '0003013833',
                        'stepId' => 'step-1',
                        'consultationUrl' => 'https://platform.example/projects/test',
                        'emailContact' => 'contact@example.com',
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

        $this->createClient($httpClient)->associateFolder($step, $metadata, 'https://platform.example/projects/test');
    }

    public function testUpdateConsultationDatesBuildsTheHubPayload(): void
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->expects($this->once())->method('getStatusCode')->willReturn(200);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with(
                'PUT',
                'http://hub.example/api/v1/folder-links/T0603151600/metadata',
                [
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                    'auth_basic' => ['platform-instance', 'password'],
                    'json' => [
                        'consultationStartDate' => '2026-09-21',
                        'consultationEndDate' => '2026-09-30',
                    ],
                ]
            )
            ->willReturn($response)
        ;

        $step = (new CollectStep())->setId('step-1');
        $step
            ->setStartAt(new \DateTime('2026-09-21 10:00:00'))
            ->setEndAt(new \DateTime('2026-09-30 18:00:00'))
        ;
        $metadata = (new HubMetadata())
            ->setAiotCode('0003013833')
            ->setFolderNumber('T0603151600')
            ->setStep((new OtherStep())->setId('hub-step-1'))
        ;

        $this->createClient($httpClient)->updateConsultationDates($step, $metadata);
    }

    public function testAssociateFolderPropagatesConflictDetails(): void
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->expects($this->once())->method('getStatusCode')->willReturn(409);
        $response->expects($this->once())->method('getContent')->with(false)->willReturn(
            'folder "T0603151600" is already associated with AIOT "0003013833"'
        );

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->willReturn($response)
        ;

        $step = (new OtherStep())->setId('step-1');
        $metadata = (new HubMetadata())
            ->setAiotCode('0003013834')
            ->setFolderNumber('T0603151600')
            ->setContactEmail('contact@example.com')
        ;

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionCode(409);
        $this->expectExceptionMessage('folder "T0603151600" is already associated with AIOT "0003013833"');

        $this->createClient($httpClient)->associateFolder($step, $metadata, 'https://platform.example/projects/test');
    }

    private function createClient(HttpClientInterface $httpClient): HubApiGreenClient
    {
        return new HubApiGreenClient(
            httpClient: $httpClient,
            logger: $this->createMock(LoggerInterface::class),
            hubApiGreenUrl: 'http://hub.example',
            onePasswordClient: new OnePasswordClient(
                new MockHttpClient([
                    new MockResponse('[{"id":"item-id","title":"platform-instance"}]'),
                    new MockResponse('{"fields":[{"purpose":"USERNAME","value":"platform-instance"},{"purpose":"PASSWORD","value":"password"}]}'),
                ]),
                'https://connect.example',
                'connect-token',
                'vault-id',
            ),
            instanceName: 'platform-instance',
        );
    }
}
