<?php

declare(strict_types=1);

namespace Capco\AppBundle\GraphQL\Mutation\HubApiGreen;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediaRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

final class SynchronizeHubApiGreenMediaMutation implements MutationInterface
{
    use MutationTrait;

    final public const INVALID_SIZE = 'INVALID_SIZE';
    final public const INVALID_S3_PATH = 'INVALID_S3_PATH';
    final public const INVALID_DATE = 'INVALID_DATE';
    final public const INVALID_FILE_TYPE = 'INVALID_FILE_TYPE';
    final public const STEP_NOT_FOUND = 'STEP_NOT_FOUND';

    private const PROVIDER_NAME = 'hub-api-green';
    private const STORAGE = 's3';
    private const MAX_CONTENT_SIZE = 2147483647;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly MediaRepository $mediaRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly string $hubApiGreenS3Bucket,
        private readonly string $hubApiGreenS3PublicUrl
    ) {
    }

    /**
     * @return array{stepId: ?string, aiotCode: ?string, folderNumber: ?string, synchronizedAt: ?\DateTime, errorCode: ?string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $stepId = $input->offsetGet('stepId');
        $aiotCode = $input->offsetGet('aiotCode');
        $folderNumber = $input->offsetGet('folderNumber');
        $documents = $input->offsetGet('documents');

        return $this->entityManager->transactional(
            fn (): array => $this->synchronize($stepId, $aiotCode, $folderNumber, $documents)
        );
    }

    /**
     * @param array<int, array<string, mixed>> $documents
     *
     * @return array{stepId: ?string, aiotCode: ?string, folderNumber: ?string, synchronizedAt: ?\DateTime, errorCode: ?string}
     */
    private function synchronize(string $stepId, string $aiotCode, string $folderNumber, array $documents): array
    {
        $step = $this->globalIdResolver->resolve(
            $stepId,
            null,
            new \ArrayObject(['disable_acl' => true])
        );
        if (!$step instanceof OtherStep) {
            return $this->errorPayload($stepId, $aiotCode, $folderNumber, self::STEP_NOT_FOUND);
        }
        $this->entityManager->lock($step, LockMode::PESSIMISTIC_WRITE);

        $data = [
            'stepId' => $stepId,
            'aiotCode' => $aiotCode,
            'folderNumber' => $folderNumber,
        ];
        $providerReferences = [];
        foreach ($documents as $document) {
            $errorCode = $this->getDocumentErrorCode($document);
            if (null !== $errorCode) {
                return $this->errorPayload($stepId, $aiotCode, $folderNumber, $errorCode);
            }
            $providerReferences[$this->getProviderReference($stepId, (int) $document['documentId'])] = true;
        }

        $mediasByReference = [];
        foreach (
            $this->mediaRepository->findByProviderReferencePrefix(
                self::PROVIDER_NAME,
                $this->getProviderReferencePrefix($stepId)
            ) as $media
        ) {
            if (isset($mediasByReference[$media->getProviderReference()])) {
                $this->entityManager->remove($media);

                continue;
            }
            $mediasByReference[$media->getProviderReference()] = $media;
        }

        foreach ($documents as $document) {
            $providerReference = $this->getProviderReference($stepId, (int) $document['documentId']);
            $media = $mediasByReference[$providerReference] ?? null;

            if (null === $media) {
                $media = new Media();
                $this->entityManager->persist($media);
            }

            $this->updateMedia($media, $data, $document, $providerReference);
            $mediasByReference[$providerReference] = $media;
        }

        foreach ($mediasByReference as $providerReference => $media) {
            if (!isset($providerReferences[$providerReference])) {
                $this->entityManager->remove($media);
            }
        }

        $step->setBody($this->buildBody($documents));

        return [
            'stepId' => $stepId,
            'aiotCode' => $aiotCode,
            'folderNumber' => $folderNumber,
            'synchronizedAt' => new \DateTime(),
            'errorCode' => null,
        ];
    }

    /**
     * @param array<string, mixed> $data
     * @param array<string, mixed> $document
     */
    private function updateMedia(Media $media, array $data, array $document, string $providerReference): void
    {
        $media
            ->setName($document['filename'])
            ->setDescription($document['documentLabel'])
            ->setEnabled(true)
            ->setProviderName(self::PROVIDER_NAME)
            ->setProviderStatus(1)
            ->setProviderReference($providerReference)
            ->setContentType($document['mimeType'])
            ->setSize($document['sizeBytes'])
            ->setContext('default')
            ->setProviderMetadata([
                'source' => self::PROVIDER_NAME,
                'storage' => self::STORAGE,
                's3Path' => $document['s3Path'],
                'stepId' => $data['stepId'],
                'aiotCode' => $data['aiotCode'],
                'folderNumber' => $data['folderNumber'],
                'documentId' => $document['documentId'],
                'documentVersion' => $document['documentVersion'],
                'documentName' => $document['documentName'],
                'documentLabel' => $document['documentLabel'],
                'fileId' => $document['fileId'],
                'fileVersion' => $document['fileVersion'],
                'filename' => $document['filename'],
                'mimeType' => $document['mimeType'],
                'sizeBytes' => $document['sizeBytes'],
                'checksum' => $document['checksum'],
                'creationDate' => $this->normalizeDate($document['creationDate']),
                'lastUpdate' => $this->normalizeDate($document['lastUpdate']),
                'classification' => $document['classification'],
            ])
        ;
    }

    /**
     * @param array<string, mixed> $document
     */
    private function getDocumentErrorCode(array $document): ?string
    {
        if ($document['sizeBytes'] < 0 || $document['sizeBytes'] > self::MAX_CONTENT_SIZE) {
            return self::INVALID_SIZE;
        }

        if (1 !== preg_match('/^\d{3}$/', (string) $document['classification']['fileType'])) {
            return self::INVALID_FILE_TYPE;
        }

        $s3Path = parse_url((string) $document['s3Path']);
        if (
            false === $s3Path
            || self::STORAGE !== ($s3Path['scheme'] ?? null)
            || $this->hubApiGreenS3Bucket !== ($s3Path['host'] ?? null)
            || '' === ltrim((string) ($s3Path['path'] ?? ''), '/')
            || isset($s3Path['user'])
            || isset($s3Path['pass'])
            || isset($s3Path['port'])
            || isset($s3Path['query'])
            || isset($s3Path['fragment'])
        ) {
            return self::INVALID_S3_PATH;
        }

        foreach (['creationDate', 'lastUpdate'] as $dateField) {
            $date = \DateTime::createFromFormat('!Y-m-d H:i:s', $this->normalizeDate($document[$dateField]));
            $errors = \DateTime::getLastErrors();
            if (false === $date || (false !== $errors && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
                return self::INVALID_DATE;
            }
        }

        return null;
    }

    private function normalizeDate(string|\DateTimeInterface $date): string
    {
        return $date instanceof \DateTimeInterface ? $date->format('Y-m-d H:i:s') : $date;
    }

    /**
     * @param array<int, array<string, mixed>> $documents
     */
    private function buildBody(array $documents): string
    {
        /**
         * @var array<string, array{key: string, label: string, order: int, documents: array<int, array<string, mixed>>}> $groups
         */
        $groups = [];
        foreach ($documents as $document) {
            $classification = $document['classification'];
            $category = trim((string) $classification['category']);
            $groupKey = '' !== $category ? $category : (string) $classification['fileType'];
            $fileType = (int) $classification['fileType'];

            if (!isset($groups[$groupKey])) {
                $groups[$groupKey] = [
                    'key' => $groupKey,
                    'label' => '' !== $category ? $category : (string) $classification['documentTypeLabel'],
                    'order' => $fileType,
                    'documents' => [],
                ];
            } else {
                $groups[$groupKey]['order'] = min($groups[$groupKey]['order'], $fileType);
            }

            $groups[$groupKey]['documents'][] = $document;
        }

        uasort($groups, static function (array $first, array $second): int {
            $orderComparison = $first['order'] <=> $second['order'];

            return 0 !== $orderComparison ? $orderComparison : strcmp($first['key'], $second['key']);
        });

        $body = '<div><h3 style="margin-bottom:16px;"><strong>Documents utiles pour comprendre le projet</strong></h3>';
        $body .= '<p>Vous trouverez ici l\'ensemble des documents disponibles pour éclairer les enjeux du projet.</p>';
        $body .= '<p><br /></p><p>Documents disponibles&nbsp;:</p>';

        foreach ($groups as $group) {
            usort($group['documents'], [self::class, 'compareDocuments']);
            $body .= sprintf('<p><strong>%s:</strong></p>', $this->escapeHtml($group['label']));

            foreach ($group['documents'] as $document) {
                $body .= sprintf(
                    '<p><a href="%s">%s</a></p>',
                    $this->escapeHtml($this->getS3PublicUrl((string) $document['s3Path'])),
                    $this->escapeHtml($document['filename'])
                );
            }
        }

        return $body . '</div>';
    }

    private function getS3PublicUrl(string $s3Path): string
    {
        return rtrim($this->hubApiGreenS3PublicUrl, '/') . '/' . ltrim((string) parse_url($s3Path, \PHP_URL_PATH), '/');
    }

    /**
     * @param array<string, mixed> $first
     * @param array<string, mixed> $second
     */
    private static function compareDocuments(array $first, array $second): int
    {
        $firstClassification = $first['classification'];
        $secondClassification = $second['classification'];
        $comparison = (int) $firstClassification['fileType'] <=> (int) $secondClassification['fileType'];
        if (0 !== $comparison) {
            return $comparison;
        }

        $comparison = strcmp(
            (string) $firstClassification['documentTypeCode'],
            (string) $secondClassification['documentTypeCode']
        );
        if (0 !== $comparison) {
            return $comparison;
        }

        $comparison = strcmp((string) $first['documentLabel'], (string) $second['documentLabel']);
        if (0 !== $comparison) {
            return $comparison;
        }

        $comparison = strcmp((string) $first['filename'], (string) $second['filename']);
        if (0 !== $comparison) {
            return $comparison;
        }

        $comparison = (int) $first['documentId'] <=> (int) $second['documentId'];
        if (0 !== $comparison) {
            return $comparison;
        }

        return (int) $first['documentVersion'] <=> (int) $second['documentVersion'];
    }

    private function escapeHtml(string $value): string
    {
        return htmlspecialchars($value, \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * @return array{stepId: ?string, aiotCode: ?string, folderNumber: ?string, synchronizedAt: null, errorCode: string}
     */
    private function errorPayload(?string $stepId, ?string $aiotCode, ?string $folderNumber, string $errorCode): array
    {
        return [
            'stepId' => $stepId,
            'aiotCode' => $aiotCode,
            'folderNumber' => $folderNumber,
            'synchronizedAt' => null,
            'errorCode' => $errorCode,
        ];
    }

    private function getProviderReference(string $stepId, int $documentId): string
    {
        return $this->getProviderReferencePrefix($stepId) . $documentId;
    }

    private function getProviderReferencePrefix(string $stepId): string
    {
        return self::PROVIDER_NAME . '-' . hash('sha256', $stepId) . '-';
    }
}
