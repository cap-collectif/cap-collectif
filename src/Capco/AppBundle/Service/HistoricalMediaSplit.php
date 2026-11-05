<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Doctrine\ORM\EntityManagerInterface;
use Gaufrette\Filesystem;
use Ramsey\Uuid\Uuid;

class HistoricalMediaSplit
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MediaDocumentReferences $documents,
        private readonly MediaPublicationPolicy $policy,
        private readonly MediaHtmlReferences $html,
        private readonly MediaAccessResolver $access,
        private readonly Filesystem $filesystem
    ) {}

    /**
     * @param list<array{class-string, array<string, mixed>}> $references
     *
     * @return array{public: int, private: list<array{object, string}>, classify: bool}
     */
    public function inspect(Media $media, array $references): array
    {
        $result = ['public' => 0, 'private' => [], 'classify' => false];
        if (Media::VOCAL_CONTRIBUTION_CONTEXT === $media->getContext()) {
            return $result;
        }
        $unsupported = null;
        foreach ($this->documents->indexedCandidates($references) as $entity) {
            foreach ($this->documents->references($entity) as $field => $medias) {
                foreach ($medias as $reference) {
                    if ($reference->getId() !== $media->getId()) {
                        continue;
                    }
                    $public = $this->policy->fieldVisibility($entity, $field);
                    $transferable = ($entity instanceof MediaResponse || $entity instanceof ValueResponse && \is_string($entity->getValue()))
                        && MediaAccessResolver::isPrivateResponse($entity);
                    if (null === $public || !$public && !$transferable) {
                        $unsupported = 'Unsupported confidential or ambiguous reference: ' . $entity::class . '.' . $field;

                        continue;
                    }
                    if ($public) {
                        ++$result['public'];
                    } else {
                        $result['private'][] = [$entity, $field];
                    }
                }
            }
        }
        // Historical editor uploads may have no privacy marker or attachment association.
        if (!$this->access->isPrivate($media) && !$result['private']) {
            return ['public' => 0, 'private' => [], 'classify' => false];
        }
        if (!$result['public']) {
            foreach ($result['private'] as [$entity]) {
                if ($entity instanceof ValueResponse && ('1' !== $media->getMetadataValue('private_attachment')
                    || !\in_array($entity->getId(), $media->getProviderMetadata()['private_html_responses'] ?? [], true))) {
                    $result['classify'] = true;
                }
            }
        }
        if (1 !== $this->em->getRepository(Media::class)->count(['context' => $media->getContext(), 'providerReference' => $media->getProviderReference()])) {
            throw new \RuntimeException('Ambiguous shared storage path.');
        }
        if (($result['public'] || $result['classify']) && $unsupported) {
            throw new \RuntimeException($unsupported);
        }
        if (($result['public'] || $result['classify']) && !$this->filesystem->has($this->path($media))) {
            throw new \RuntimeException('Source file is missing.');
        }

        return $result;
    }

    /** @param list<array{class-string, array<string, mixed>}> $references */
    public function apply(Media $media, array $references): ?string
    {
        $connection = $this->em->getConnection();
        $connection->beginTransaction();
        $copyPath = null;
        $createdFile = false;

        try {
            $row = $connection->fetchAssociative('SELECT * FROM media__media WHERE id = ? FOR UPDATE', [$media->getId()]);
            if (!$row) {
                throw new \RuntimeException('Source media disappeared.');
            }
            $plan = $this->inspect($media, $references);
            if (!$plan['public'] && !$plan['classify']) {
                $connection->commit();

                return null;
            }
            $metadata = json_decode((string) $row['provider_metadata'], true) ?: [];
            $privateHtmlResponses = [];
            foreach ($plan['private'] as [$entity]) {
                if ($entity instanceof ValueResponse) {
                    $privateHtmlResponses[] = $entity->getId();
                }
            }
            if (!$plan['public']) {
                $metadata['private_attachment'] = '1';
                $metadata['private_html_responses'] = array_values(array_unique([...($metadata['private_html_responses'] ?? []), ...$privateHtmlResponses]));
                $connection->update('media__media', ['provider_metadata' => json_encode($metadata, \JSON_THROW_ON_ERROR)], ['id' => $media->getId()]);
                $connection->commit();

                return null;
            }
            $copyId = null;
            if ($plan['private']) {
                $copyId = Uuid::uuid5(Uuid::NAMESPACE_URL, 'capco-private-copy:' . $media->getId())->toString();
                $reference = 'private-' . $copyId . '.' . pathinfo($media->getProviderReference(), \PATHINFO_EXTENSION);
                $copyPath = (string) $media->getContext() . '/0001/01/' . $reference;
                $bytes = $this->filesystem->read($this->path($media));
                if (!$this->filesystem->has($copyPath)) {
                    $createdFile = true;
                    $this->filesystem->write($copyPath, $bytes, false);
                }
                if (hash('sha256', $bytes) !== hash('sha256', $this->filesystem->read($copyPath))) {
                    throw new \RuntimeException('Copy verification failed.');
                }
                $copy = $row;
                $copy['id'] = $copyId;
                $copy['provider_reference'] = $reference;
                $copy['provider_metadata'] = json_encode([
                    'private_attachment' => '1',
                    'historical_original_id' => $media->getId(),
                    'private_html_responses' => array_values(array_unique($privateHtmlResponses)),
                ], \JSON_THROW_ON_ERROR);
                $connection->insert('media__media', $copy);
                foreach ($plan['private'] as [$entity, $field]) {
                    if ($entity instanceof MediaResponse) {
                        $connection->executeStatement('UPDATE responses_medias SET media_id = ? WHERE response_id = ? AND media_id = ?', [$copyId, $entity->getId(), $media->getId()]);
                    } elseif ($entity instanceof ValueResponse && 'value' === $field) {
                        $value = $this->html->replace((string) $entity->getValue(), $media, $reference);
                        foreach ($this->html->references($value) as $remaining) {
                            if ($remaining->getId() === $media->getId()) {
                                throw new \RuntimeException('A private HTML reference could not be rewritten.');
                            }
                        }
                        $mapping = $this->em->getClassMetadata(ValueResponse::class);
                        $connection->update($mapping->getTableName(), ['value' => json_encode($value, \JSON_THROW_ON_ERROR)], ['id' => $entity->getId()]);
                    } else {
                        throw new \RuntimeException('Unsupported private field.');
                    }
                }
                $metadata['historical_private_copy'] = $copyId;
            }
            unset($metadata['private_attachment'], $metadata['published_publicly']);
            $metadata['historical_public_original'] = '1';
            $connection->update('media__media', ['provider_metadata' => json_encode($metadata, \JSON_THROW_ON_ERROR)], ['id' => $media->getId()]);
            $connection->commit();

            return $copyId;
        } catch (\Throwable $error) {
            $connection->rollBack();
            if ($createdFile && $copyPath && $this->filesystem->has($copyPath)) {
                $this->filesystem->delete($copyPath);
            }

            throw $error;
        } finally {
            $this->em->clear();
        }
    }

    private function path(Media $media): string
    {
        return (string) $media->getContext() . '/0001/01/' . $media->getProviderReference();
    }
}
