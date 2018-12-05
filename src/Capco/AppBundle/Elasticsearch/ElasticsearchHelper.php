<?php

namespace Capco\AppBundle\Elasticsearch;

use Elastica\Query;
use Symfony\Component\Yaml\Dumper;

final class ElasticsearchHelper
{
    /**
     * return executed ES query as json or yaml
     */
    public static function debugQuery(Query $query, bool $asYaml = false): ?string
    {
        $debug = ['query' => $query->getQuery()->toArray()];

        if (false === $asYaml) {
            return json_encode($debug, JSON_PRETTY_PRINT);
        }

        $dumper = new Dumper();

        return $dumper->dump($debug, 100);
    }
}
