<?php

namespace Capco\AppBundle\Elasticsearch;

interface IndexableInterface
{
    /**
     * Used as the Document ID in Elasticsearch.
     *
     * @return string|int
     */
    public function getId();

    /**
     * Tells if this object MUST be sent to Elasticsearch.
     * If FALSE, we force the removal from ES.
     */
    public function isIndexable(): bool;

    /**
     * The Elasticsearch Type name. Must exists in `src/Capco/AppBundle/Elasticsearch/mapping.yaml`.
     */
    public static function getElasticsearchTypeName(): string;

    /**
     * The JMS Serializer serialization groups.
     */
    public static function getElasticsearchSerializationGroups(): array;

    public static function getElasticsearchPriority(): int;
}
