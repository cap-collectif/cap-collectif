<?php

namespace Capco\AppBundle\GraphQL;

/**
 * This class represents a GraphQL API deprecation
 */
final class Deprecation
{
    /**
     * Generates a consistent deprecation reason
     * to avoid free form text.
     */
    public static function toString(array $params): string
    {
        $description = isset($params['description']) ? $params['description'] . ' ' : '';
        $supersededBy = isset($params['supersededBy']) ? $params['supersededBy'] . ' ' : '';
        $reason = isset($params['reason']) ? $params['reason'] . ' ' : '';
        $deletedAt = 'Removal on ' . $params['startAt'] . ' UTC.';

        return $description . $supersededBy . $reason . $deletedAt;
    }
}
