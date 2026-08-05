<?php

declare(strict_types=1);

namespace Capco\Tests\Mutation\HubApiGreen;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\GraphQL\Mutation\HubApiGreen\SynchronizeHubApiGreenMediaMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\MediaRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class SynchronizeHubApiGreenMediaMutationTest extends TestCase
{
    private const S3_PUBLIC_URL = 'https://hub-api-green.s3.fr-par.scw.cloud';

    public function testCreatesUpdatesAndReplaysTheSameMedia(): void
    {
        /** @var array<Media> $persistedMedias */
        $persistedMedias = [];
        $mediaRepository = $this->createMock(MediaRepository::class);
        $mediaRepository
            ->expects($this->exactly(3))
            ->method('findByProviderReferencePrefix')
            ->with('hub-api-green', $this->providerReferencePrefix())
            ->willReturnCallback(static function () use (&$persistedMedias): array {
                return $persistedMedias;
            })
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager
            ->expects($this->once())
            ->method('persist')
            ->willReturnCallback(static function (Media $media) use (&$persistedMedias): void {
                $persistedMedias[] = $media;
            })
        ;
        $entityManager
            ->expects($this->once())
            ->method('remove')
            ->willReturnCallback(static function (Media $media) use (&$persistedMedias): void {
                $persistedMedias = array_values(array_filter(
                    $persistedMedias,
                    static fn (Media $persistedMedia): bool => $persistedMedia !== $media
                ));
            })
        ;
        $this->configureTransaction($entityManager);
        $entityManager
            ->expects($this->exactly(3))
            ->method('lock')
            ->with(self::isInstanceOf(OtherStep::class), LockMode::PESSIMISTIC_WRITE)
        ;

        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $step = new OtherStep();
        $globalIdResolver
            ->expects($this->exactly(3))
            ->method('resolve')
            ->with(
                'step-id-platform',
                null,
                self::callback(static fn (\ArrayObject $context): bool => true === $context->offsetGet('disable_acl'))
            )
            ->willReturn($step)
        ;

        $mutation = new SynchronizeHubApiGreenMediaMutation(
            $globalIdResolver,
            $mediaRepository,
            $entityManager,
            'hub-api-green',
            self::S3_PUBLIC_URL
        );
        $payload = $this->payload();
        $payload['documents'][0]['creationDate'] = new \DateTime('2026-06-03 15:21:38');
        $payload['documents'][0]['lastUpdate'] = new \DateTime('2026-06-03 15:21:38');
        $input = new Argument(['input' => $payload]);

        $firstResult = $mutation($input);
        $persistedMedia = $persistedMedias[0];

        self::assertSame('step-id-platform', $firstResult['stepId']);
        self::assertSame('code-aiot', $firstResult['aiotCode']);
        self::assertSame('T0603151600', $firstResult['folderNumber']);
        self::assertNull($firstResult['errorCode']);
        self::assertInstanceOf(\DateTime::class, $firstResult['synchronizedAt']);
        self::assertSame($this->providerReferencePrefix() . 16233, $persistedMedia->getProviderReference());
        self::assertSame('MaitriseFoncere.pdf', $persistedMedia->getName());
        self::assertSame('application/pdf', $persistedMedia->getContentType());
        self::assertSame(526504960, $persistedMedia->getSize());
        self::assertTrue($persistedMedia->isEnabled());
        self::assertSame('hub-api-green', $persistedMedia->getProviderName());
        self::assertSame(
            's3://hub-api-green/step-id-platform/T0603151600/16233/1/MaitriseFoncere.pdf',
            $persistedMedia->getProviderMetadata()['s3Path']
        );
        self::assertSame('step-id-platform', $persistedMedia->getProviderMetadata()['stepId']);
        self::assertSame('2026-06-03 15:21:38', $persistedMedia->getProviderMetadata()['creationDate']);
        self::assertSame('2026-06-03 15:21:38', $persistedMedia->getProviderMetadata()['lastUpdate']);
        self::assertSame(
            'JUSTFONC',
            $persistedMedia->getProviderMetadata()['classification']['documentTypeCode']
        );
        self::assertSame(
            '<div><h3 style="margin-bottom:16px;"><strong>Documents utiles pour comprendre le projet</strong></h3><p>Vous trouverez ici l\'ensemble des documents disponibles pour éclairer les enjeux du projet.</p><p><br /></p><p>Documents disponibles&nbsp;:</p><p><strong>Justificatif de maîtrise foncière:</strong></p><p><a href="https://hub-api-green.s3.fr-par.scw.cloud/step-id-platform/T0603151600/16233/1/MaitriseFoncere.pdf">MaitriseFoncere.pdf</a></p></div>',
            $step->getBody()
        );

        $updatedPayload = $this->payload();
        $updatedPayload['documents'][0]['documentVersion'] = 2;
        $updatedPayload['documents'][0]['fileVersion'] = 2;
        $updatedPayload['documents'][0]['filename'] = 'MaitriseFoncere-v2.pdf';
        $updatedPayload['documents'][0]['s3Path'] = 's3://hub-api-green/step-id-platform/T0603151600/16233/2/MaitriseFoncere-v2.pdf';

        $secondResult = $mutation(new Argument(['input' => $updatedPayload]));

        self::assertSame('step-id-platform', $secondResult['stepId']);
        self::assertNull($secondResult['errorCode']);
        self::assertSame($this->providerReferencePrefix() . 16233, $persistedMedia->getProviderReference());
        self::assertSame('MaitriseFoncere-v2.pdf', $persistedMedia->getName());
        self::assertSame(2, $persistedMedia->getProviderMetadata()['documentVersion']);
        self::assertSame(2, $persistedMedia->getProviderMetadata()['fileVersion']);
        self::assertSame(
            's3://hub-api-green/step-id-platform/T0603151600/16233/2/MaitriseFoncere-v2.pdf',
            $persistedMedia->getProviderMetadata()['s3Path']
        );
        self::assertStringContainsString('>MaitriseFoncere-v2.pdf</a>', $step->getBody());
        self::assertStringContainsString(
            'href="https://hub-api-green.s3.fr-par.scw.cloud/step-id-platform/T0603151600/16233/2/MaitriseFoncere-v2.pdf"',
            $step->getBody()
        );

        $duplicateMedia = new Media();
        $duplicateMedia->setProviderReference($persistedMedia->getProviderReference());
        $persistedMedias[] = $duplicateMedia;

        $thirdResult = $mutation(new Argument(['input' => $updatedPayload]));

        self::assertNull($thirdResult['errorCode']);
        self::assertCount(1, $persistedMedias);
    }

    public function testReplacesAndSortsTheCompleteOtherStepBody(): void
    {
        $payload = $this->payload();
        foreach ([
            [
                'documentId' => 16234,
                'documentName' => 'avis.pdf',
                'filename' => 'Avis.pdf',
                'fileType' => '001',
                'documentTypeCode' => 'PRESENT',
                'documentTypeLabel' => 'Présentation non technique',
                'category' => 'Description et présentation du projet',
            ],
            [
                'documentId' => 16235,
                'documentName' => 'geolocalisation.pdf',
                'filename' => 'Geolocalisation.pdf',
                'fileType' => '003',
                'documentTypeCode' => 'GEOLOC',
                'documentTypeLabel' => 'Géolocalisation du projet',
                'category' => 'Localisation du projet',
            ],
            [
                'documentId' => 16236,
                'documentName' => 'parcelles.pdf',
                'filename' => 'Parcelles.pdf',
                'fileType' => '041',
                'documentTypeCode' => 'PARCELLES',
                'documentTypeLabel' => 'Parcelles géographiques',
                'category' => 'Localisation du projet',
            ],
            [
                'documentId' => 16237,
                'documentName' => 'synthese.pdf',
                'filename' => 'Synthese.pdf',
                'fileType' => '002',
                'documentTypeCode' => 'SYNTME',
                'documentTypeLabel' => 'Synthèse des mesures envisagées',
                'category' => 'Description et présentation du projet',
            ],
        ] as $document) {
            $payload['documents'][] = [
                ...$payload['documents'][0],
                'documentId' => $document['documentId'],
                'documentName' => $document['documentName'],
                'filename' => $document['filename'],
                's3Path' => sprintf(
                    's3://hub-api-green/step-id-platform/T0603151600/%d/1/%s',
                    $document['documentId'],
                    $document['filename']
                ),
                'classification' => [
                    'fileType' => $document['fileType'],
                    'documentTypeCode' => $document['documentTypeCode'],
                    'documentTypeLabel' => $document['documentTypeLabel'],
                    'category' => $document['category'],
                ],
            ];
        }
        $staleMedia = new Media();
        $staleMedia
            ->setEnabled(true)
            ->setProviderReference($this->providerReferencePrefix() . 99999)
        ;
        $mediaRepository = $this->createMock(MediaRepository::class);
        $mediaRepository
            ->expects($this->once())
            ->method('findByProviderReferencePrefix')
            ->with('hub-api-green', $this->providerReferencePrefix())
            ->willReturn([$staleMedia])
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->exactly(5))->method('persist');
        $entityManager->expects($this->once())->method('remove')->with($staleMedia);
        $this->configureTransaction($entityManager);
        $entityManager
            ->expects($this->once())
            ->method('lock')
            ->with(self::isInstanceOf(OtherStep::class), LockMode::PESSIMISTIC_WRITE)
        ;

        $step = new OtherStep();
        $step->setBody('<p>Ancienne entrée à supprimer</p>');
        $globalIdResolver = $this->createStub(GlobalIdResolver::class);
        $globalIdResolver->method('resolve')->willReturn($step);

        $mutation = new SynchronizeHubApiGreenMediaMutation(
            $globalIdResolver,
            $mediaRepository,
            $entityManager,
            'hub-api-green',
            self::S3_PUBLIC_URL
        );

        $mutation(new Argument(['input' => $payload]));

        self::assertStringNotContainsString('Ancienne entrée', $step->getBody());
        self::assertStringContainsString('<p><strong>Justificatif de maîtrise foncière:</strong></p>', $step->getBody());
        self::assertStringContainsString('<p><strong>Description et présentation du projet:</strong></p>', $step->getBody());
        self::assertStringContainsString('<p><strong>Localisation du projet:</strong></p>', $step->getBody());
        self::assertSame(1, substr_count((string) $step->getBody(), '<p><strong>Description et présentation du projet:</strong></p>'));
        self::assertSame(1, substr_count((string) $step->getBody(), '<p><strong>Localisation du projet:</strong></p>'));
        self::assertStringContainsString('>Avis.pdf</a>', $step->getBody());
        self::assertStringContainsString('>Synthese.pdf</a>', $step->getBody());
        self::assertStringContainsString('>Geolocalisation.pdf</a>', $step->getBody());
        self::assertStringContainsString('>Parcelles.pdf</a>', $step->getBody());
        self::assertStringContainsString(
            'href="https://hub-api-green.s3.fr-par.scw.cloud/step-id-platform/T0603151600/16236/1/Parcelles.pdf"',
            $step->getBody()
        );
        $position = static fn (string $filename): int => (int) strpos((string) $step->getBody(), '>' . $filename . '</a>');
        self::assertLessThan(
            $position('Synthese.pdf'),
            $position('Avis.pdf')
        );
        self::assertLessThan(
            $position('Geolocalisation.pdf'),
            $position('Synthese.pdf')
        );
        self::assertLessThan(
            $position('Parcelles.pdf'),
            $position('Geolocalisation.pdf')
        );
        self::assertLessThan(
            $position('MaitriseFoncere.pdf'),
            $position('Parcelles.pdf')
        );
    }

    /**
     * @dataProvider invalidPayloadProvider
     */
    public function testRejectsInvalidPayload(
        bool $stepExists,
        ?string $s3Path,
        ?string $fileType,
        string $errorCode
    ): void {
        $payload = $this->payload();
        if (null !== $s3Path) {
            $payload['documents'][0]['s3Path'] = $s3Path;
        }
        if (null !== $fileType) {
            $payload['documents'][0]['classification']['fileType'] = $fileType;
        }

        $globalIdResolver = $this->createStub(GlobalIdResolver::class);
        $globalIdResolver->method('resolve')->willReturn(
            $stepExists ? new OtherStep() : null
        );

        $entityManager = $this->createStub(EntityManagerInterface::class);
        $this->configureTransaction($entityManager);

        $mutation = new SynchronizeHubApiGreenMediaMutation(
            $globalIdResolver,
            $this->createStub(MediaRepository::class),
            $entityManager,
            'hub-api-green',
            self::S3_PUBLIC_URL
        );

        $result = $mutation(new Argument(['input' => $payload]));

        self::assertSame($errorCode, $result['errorCode']);
        self::assertNull($result['synchronizedAt']);
    }

    /**
     * @return iterable<string, array{stepExists: bool, s3Path: ?string, fileType: ?string, errorCode: string}>
     */
    public static function invalidPayloadProvider(): iterable
    {
        yield 'invalid S3 path' => [
            'stepExists' => true,
            's3Path' => 'not-a-url',
            'fileType' => null,
            'errorCode' => 'INVALID_S3_PATH',
        ];

        yield 'HTTP S3 path' => [
            'stepExists' => true,
            's3Path' => 'https://hub-api-green.s3.eu-west-3.amazonaws.com/document.pdf',
            'fileType' => null,
            'errorCode' => 'INVALID_S3_PATH',
        ];

        yield 'unexpected S3 bucket' => [
            'stepExists' => true,
            's3Path' => 's3://another-bucket/document.pdf',
            'fileType' => null,
            'errorCode' => 'INVALID_S3_PATH',
        ];

        yield 'missing S3 object key' => [
            'stepExists' => true,
            's3Path' => 's3://hub-api-green',
            'fileType' => null,
            'errorCode' => 'INVALID_S3_PATH',
        ];

        yield 'invalid file type' => [
            'stepExists' => true,
            's3Path' => null,
            'fileType' => '1',
            'errorCode' => 'INVALID_FILE_TYPE',
        ];

        yield 'unknown step' => [
            'stepExists' => false,
            's3Path' => null,
            'fileType' => null,
            'errorCode' => 'STEP_NOT_FOUND',
        ];
    }

    private function configureTransaction(EntityManagerInterface $entityManager): void
    {
        $entityManager
            ->method('transactional')
            ->willReturnCallback(static fn (callable $callback) => $callback($entityManager))
        ;
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        return [
            'stepId' => 'step-id-platform',
            'aiotCode' => 'code-aiot',
            'folderNumber' => 'T0603151600',
            'documents' => [
                [
                    'documentId' => 16233,
                    'documentVersion' => 1,
                    'documentName' => 'fichierJustificatifMaitriseFoncere.pdf',
                    'documentLabel' => 'Justificatif de maîtrise foncière',
                    's3Path' => 's3://hub-api-green/step-id-platform/T0603151600/16233/1/MaitriseFoncere.pdf',
                    'fileId' => 15840,
                    'fileVersion' => 1,
                    'filename' => 'MaitriseFoncere.pdf',
                    'mimeType' => 'application/pdf',
                    'sizeBytes' => 526504960,
                    'checksum' => '0kmHp0VSyBvmVAhTVoRyMZfkyeF3Mdkv9DNAqFhCRzE=',
                    'creationDate' => '2026-06-03 15:21:38',
                    'lastUpdate' => '2026-06-03 15:21:38',
                    'classification' => [
                        'fileType' => '004',
                        'documentTypeCode' => 'JUSTFONC',
                        'documentTypeLabel' => 'Justificatif de maîtrise foncière',
                        'category' => null,
                    ],
                ],
            ],
        ];
    }

    private function providerReferencePrefix(): string
    {
        return 'hub-api-green-' . hash('sha256', 'step-id-platform') . '-';
    }
}
