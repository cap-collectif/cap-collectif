<?php

namespace Capco\AppBundle\GraphQL;

use GraphQL\Type\Definition\ResolveInfo;

class GraphQLRequestedFields
{
    /**
     * @return list<string>
     */
    public function getRequestedFields(ResolveInfo $info): array
    {
        $fields = [];

        $fieldNodes = $info->fieldNodes;
        foreach ($fieldNodes as $fieldNode) {
            if (!isset($fieldNode->selectionSet)) {
                continue;
            }

            foreach ($fieldNode->selectionSet->selections as $selection) {
                if (property_exists($selection, 'name')) {
                    $fields[] = $selection->name->value;
                }
            }
        }

        return $fields;
    }

    public function isOnlyFetchingTotalCount(ResolveInfo $info): bool
    {
        $fields = $this->getRequestedFields($info);

        return 1 === \count($fields) && 'totalCount' === $fields[0];
    }
}
