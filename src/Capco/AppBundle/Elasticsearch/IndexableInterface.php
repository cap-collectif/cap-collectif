<?php

namespace Capco\AppBundle\Elasticsearch;

interface IndexableInterface
{
    /**
     * Used as the Document ID in Elasticsearch.
     *
     * @return string|integer
     */
    public function getId();

    /**
     * Tells if this object MUST be sent to Elasticsearch.
     * If FALSE, we force the removal from ES.
     *
     * @return bool
     */
    public function isIndexable();

    /**
     * The Elasticsearch Type name. Must exists in `src/Capco/AppBundle/Elasticsearch/mapping.yml`.
     *
     * @return string
     */
    public static function getElasticsearchTypeName();

    /**
     * The JMS Serializer serialization groups.
     *
     * @return array
     */
    public function getElasticsearchSerializationGroups();
}
