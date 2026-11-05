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
