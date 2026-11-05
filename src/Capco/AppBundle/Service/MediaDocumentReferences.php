<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;

class MediaDocumentReferences
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly MediaHtmlReferences $html) {}

    /**
     * @param null|list<string> $changedFields
     *
     * @return array<string, list<Media>>
     */
    public function references(object $entity, ?array $changedFields = null): array
    {
        if ($entity instanceof Media) {
            return [];
        }
        $metadata = $this->em->getClassMetadata($entity::class);
        $result = [];
        foreach ($this->fields($metadata) as $field) {
            if (null !== $changedFields && !\in_array($field, $changedFields, true)) {
                continue;
            }
            $value = $metadata->getFieldValue($entity, $field);
            $medias = $this->valueReferences($value);
            if ($medias) {
                $result[$field] = $medias;
            }
        }

        foreach ($metadata->associationMappings as $field => $mapping) {
            if (Media::class === $mapping['targetEntity'] && (null === $changedFields || \in_array($field, $changedFields, true))) {
                $value = $metadata->getFieldValue($entity, $field);
                $medias = $value instanceof Media ? [$value] : (is_iterable($value) ? [...$value] : []);
                if ($medias) {
                    $result[$field] = array_values(array_filter($medias, static fn ($media): bool => $media instanceof Media));
                }
            }
        }

        return $result;
    }

    /** @return array<string, list<array{class-string, array<string, mixed>}>> */
    public function inventory(int $batchSize, callable $progress, ?string $mediaId = null): array
    {
        $inventory = [];
        foreach ($this->candidates($batchSize, $progress) as $entity) {
            $metadata = $this->em->getClassMetadata($entity::class);
            foreach ($this->references($entity) as $medias) {
                foreach ($medias as $media) {
                    if (null === $mediaId || $mediaId === $media->getId()) {
                        $inventory[$media->getId()][] = [$metadata->name, $metadata->getIdentifierValues($entity)];
                    }
                }
            }
        }

        return $inventory;
    }

    /**
     * @param list<array{class-string, array<string, mixed>}> $references
     *
     * @return iterable<object>
     */
    public function indexedCandidates(array $references): iterable
    {
        $seen = [];
        foreach ($references as [$class, $id]) {
            $key = $class . ':' . json_encode($id);
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $entity = $this->em->find($class, $id);
            if (null === $entity) {
                throw new \RuntimeException('An inventoried reference disappeared; rerun the inventory during maintenance.');
            }

            $this->em->initializeObject($entity);

            yield $entity;
        }
    }

    /** @return iterable<object> */
    private function candidates(int $batchSize, callable $progress): iterable
    {
        $seen = [];
        $queries = [];
        foreach ($this->em->getMetadataFactory()->getAllMetadata() as $metadata) {
            if ($metadata->isMappedSuperclass || $metadata->isEmbeddedClass || Media::class === $metadata->name) {
                continue;
            }
            $conditions = [];
            foreach ($this->fields($metadata) as $field) {
                // JSON may encode '<' as a Unicode escape; inspect its decoded value.
                $conditions[] = 'e.' . $field . ' LIKE :html';
                if ('json' === $metadata->fieldMappings[$field]['type']) {
                    $conditions[] = 'e.' . $field . ' LIKE :escapedHtml';
                }
            }
            foreach ($metadata->associationMappings as $field => $mapping) {
                if (Media::class === $mapping['targetEntity']) {
                    $conditions[] = 'e.' . $field . ($metadata->isCollectionValuedAssociation($field) ? ' IS NOT EMPTY' : ' IS NOT NULL');
                }
            }
            if (!$conditions) {
                continue;
            }
            $builder = $this->em->createQueryBuilder()->select('e')->from($metadata->name, 'e')->where(implode(' OR ', $conditions));
            if (str_contains(implode('', $conditions), ':html')) {
                $builder->setParameter('html', '%<%');
            }
            if (str_contains(implode('', $conditions), ':escapedHtml')) {
                $builder->setParameter('escapedHtml', '%\\\u003%');
            }
            $query = $builder->getQuery();
            $sql = $query->getSQL();
            if (isset($queries[$sql])) {
                continue;
            }
            $queries[$sql] = true;
            $progress(0, $metadata->name);
            $processed = 0;
            foreach ($query->toIterable() as $entity) {
                $entityMetadata = $this->em->getClassMetadata($entity::class);
                $key = $entityMetadata->name . ':' . json_encode($entityMetadata->getIdentifierValues($entity));
                if (!isset($seen[$key])) {
                    $seen[$key] = true;

                    yield $entity;
                    $progress(1, $metadata->name);
                }
                if (0 === ++$processed % $batchSize) {
                    $this->em->clear();
                }
            }
            $this->em->clear();
        }
    }

    /** @return list<Media> */
    private function valueReferences(mixed $value): array
    {
        if (\is_string($value)) {
            return $this->html->references($value);
        }
        $result = [];
        if (\is_array($value)) {
            foreach ($value as $item) {
                $result = [...$result, ...$this->valueReferences($item)];
            }
        }

        return $result;
    }

    /** @return list<string> */
    private function fields(ClassMetadata $metadata): array
    {
        $fields = [];
        foreach ($metadata->fieldMappings as $field => $mapping) {
            if (\in_array($mapping['type'], ['text', 'json', 'string'], true)
                && !\in_array($field, ['id', 'password', 'token', 'providerMetadata'], true)) {
                $fields[] = $field;
            }
        }

        return $fields;
    }
}
