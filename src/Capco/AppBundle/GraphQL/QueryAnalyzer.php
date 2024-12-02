<?php

namespace Capco\AppBundle\GraphQL;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\AppBundle\Toggle\Manager;
use GraphQL\Type\Definition\ResolveInfo;

class QueryAnalyzer
{
    public function __construct(private readonly Indexer $indexer, private readonly TypeResolver $typeResolver, private readonly Manager $toggleManager)
    {
    }

    /**
     * This add data to our ElasticSearch index for API usage monitoring.
     *
     * TODO: add clientId support
     */
    public function analyseQuery(ResolveInfo $resolveInfo)
    {
        if (!$this->toggleManager->isActive('graphql_query_analytics')) {
            return;
        }

        $queryPlan = $resolveInfo->lookAhead();
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();
        $now = new \DateTime();

        foreach ($queryPlan->getReferencedTypes() as $type) {
            foreach ($queryPlan->subFields($type) as $field) {
                $this->indexer->addApiAnalyticsDocumentToBulk([
                    'graphql_type' => $type,
                    'graphql_field' => $field,
                    'graphql_schema' => $currentSchemaName,
                    'host' => '',
                    'clientId' => '',
                    'createdAt' => \Elastica\Util::convertDateTimeObject($now),
                ]);
            }
        }
        $this->indexer->finishBulk();
    }
}
